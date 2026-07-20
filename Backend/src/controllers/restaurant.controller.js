import prisma from "../prisma/prisma.js";
import asyncHandler from "../utils/asyncHandler.js";
import { api_error } from "../utils/errorHandler.js";
import { ONBOARDING_STEP } from "../utils/onboardingSteps.js";
import { DayOfWeek } from "@prisma/client";
import { uploadFile, deleteFile } from "../utils/cloudinary.js";

export const createRestaurant = asyncHandler(async (req, res) => {
    let {
        restaurantName,
        restaurantType,
        contactNumber,
        email,
        fssaiNumber,
        establishedYear,
        cuisineTypes,
    } = req.body;

    restaurantName = restaurantName?.trim();
    contactNumber = contactNumber?.trim();
    email = email?.trim().toLowerCase();

    if (
        !restaurantName ||
        !restaurantType ||
        !contactNumber ||
        !email ||
        !Array.isArray(cuisineTypes) ||
        cuisineTypes.length === 0
    ) {
        throw new api_error(
            400,
            "Restaurant name, restaurant type, contact number, email and cuisine types are required."
        );
    }

    try {
        const restaurant = await prisma.restaurant.create({
            data: {
                userId: req.user.id,
                restaurantName,
                restaurantType,
                contactNumber,
                email,
                fssaiNumber,
                establishedYear,
                cuisineTypes: cuisineTypes.map(cuisine => cuisine.trim()),
            },
        });

        return res.status(201).json({
            success: true,
            message: "Restaurant created successfully.",
            data: {
                id: restaurant.id,
                restaurantName: restaurant.restaurantName,
                currentStep: restaurant.currentStep,
                status: restaurant.status,
            }
        });

    } catch (err) {

        if (err.code === "P2002") {
            const field = err.meta?.target?.[0];

            const errors = {
                userId: "You have already registered a restaurant.",
                email: "Restaurant email already exists.",
                contactNumber: "Contact number already exists.",
            };

            throw new api_error(409, errors[field] || "Duplicate data.");
        }

        throw err;
    }   
});

export const updateDocuments = asyncHandler(async (req, res) => {
  const restaurantId = req.restaurantId;
  const files = req.files;

  if (!files || Object.keys(files).length === 0) {
    throw new api_error(400, "At least one file must be uploaded.");
  }

  const allowedFields = ["fssaiCertificate", "gstCertificate", "logo", "banner"];
  const FIELD_SIZE_LIMITS = {
    fssaiCertificate: 10 * 1024 * 1024,
    gstCertificate: 10 * 1024 * 1024,
    logo: 5 * 1024 * 1024,
    banner: 5 * 1024 * 1024,
  };

  for (const field of Object.keys(files)) {
    if (!allowedFields.includes(field)) {
      throw new api_error(400, `Unexpected field "${field}".`);
    }
    const file = files[field][0];
    if (!file?.buffer?.length) {
      throw new api_error(400, `${field} file is empty.`);
    }
    if (file.size > FIELD_SIZE_LIMITS[field]) {
      const limit = FIELD_SIZE_LIMITS[field] / (1024 * 1024);
      throw new api_error(400, `${field} file exceeds the ${limit} MB limit.`);
    }
  }

  const existing = await prisma.restaurantDocument.findUnique({
    where: { restaurantId },
    select: { id: true },
  });

  if (!existing && !files.fssaiCertificate) {
    throw new api_error(400, "FSSAI certificate is required.");
  }

  const folder = `restaurants/${restaurantId}/documents`;
  const uploadResults = {};
  const uploadedUrls = [];

  const uploadTasks = Object.keys(files).map(async (field) => {
    const url = await uploadFile(files[field][0], `${folder}/${field}`);
    uploadResults[field] = url;
    uploadedUrls.push(url);
  });

  await Promise.all(uploadTasks);

  try {
    await prisma.$transaction([
      prisma.restaurantDocument.upsert({
        where: { restaurantId },
        create: {
          restaurantId,
          fssaiCertificateUrl: uploadResults.fssaiCertificate,
          gstCertificateUrl: uploadResults.gstCertificate ?? null,
          logoUrl: uploadResults.logo ?? null,
          bannerUrl: uploadResults.banner ?? null,
        },
        update: {
          ...(uploadResults.fssaiCertificate && { fssaiCertificateUrl: uploadResults.fssaiCertificate }),
          ...(uploadResults.gstCertificate && { gstCertificateUrl: uploadResults.gstCertificate }),
          ...(uploadResults.logo && { logoUrl: uploadResults.logo }),
          ...(uploadResults.banner && { bannerUrl: uploadResults.banner }),
        },
      }),
      prisma.restaurant.update({
        where: { id: restaurantId },
        data: { currentStep: ONBOARDING_STEP.DOCUMENTS },
      }),
    ]);
  } catch (err) {
    try {
      await Promise.all(uploadedUrls.map((url) => deleteFile(url)));
    } catch {
      // cleanup failure must never hide the original database error
    }
    throw err;
  }

  return res.status(200).json({
    success: true,
    message: "Documents uploaded successfully.",
  });
});

export const updateBusinessHours = asyncHandler(async (req, res) => {
  const hours = req.body;
  const restaurantId = req.restaurantId;

  if (!Array.isArray(hours)) {
    throw new api_error(400, "Business hours must be an array.");
  }

  if (hours.length === 0 || hours.length > 7) {
    throw new api_error(400, "Business hours must contain between 1 and 7 entries.");
  }

  const validDays = new Set(Object.values(DayOfWeek));
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
  const seenDays = new Set();

  for (let i = 0; i < hours.length; i++) {
    const entry = hours[i];
    const dayOfWeek = entry?.dayOfWeek?.trim().toUpperCase();

    if (!dayOfWeek) {
      throw new api_error(400, `Entry at index ${i} is missing dayOfWeek.`);
    }

    if (!validDays.has(dayOfWeek)) {
      throw new api_error(400, `Invalid dayOfWeek "${dayOfWeek}" at index ${i}.`);
    }

    if (seenDays.has(dayOfWeek)) {
      throw new api_error(400, `Duplicate dayOfWeek "${dayOfWeek}".`);
    }
    seenDays.add(dayOfWeek);

    const { closed = false, openTime, closeTime } = entry;

    if (typeof closed !== "boolean") {
      throw new api_error(400, `"closed" must be a boolean at index ${i}.`);
    }

    if (closed) continue;

    const trimmedOpen = openTime?.trim();
    const trimmedClose = closeTime?.trim();

    if (!trimmedOpen || !trimmedClose) {
      throw new api_error(
        400,
        `openTime and closeTime are required when closed is false at index ${i}.`
      );
    }

    if (!timeRegex.test(trimmedOpen)) {
      throw new api_error(400, `Invalid openTime format "${trimmedOpen}" at index ${i}. Use HH:mm.`);
    }

    if (!timeRegex.test(trimmedClose)) {
      throw new api_error(400, `Invalid closeTime format "${trimmedClose}" at index ${i}. Use HH:mm.`);
    }

    if (trimmedOpen >= trimmedClose) {
      throw new api_error(400, `openTime must be before closeTime at index ${i}.`);
    }

    entry._openTime = trimmedOpen;
    entry._closeTime = trimmedClose;
  }

  await prisma.$transaction([
    prisma.businessHour.deleteMany({ where: { restaurantId } }),
    prisma.businessHour.createMany({
      data: hours.map(({ dayOfWeek, closed, _openTime, _closeTime }) => ({
        restaurantId,
        dayOfWeek: dayOfWeek.trim().toUpperCase(),
        openTime: closed ? null : (_openTime ?? null),
        closeTime: closed ? null : (_closeTime ?? null),
        closed: closed === true,
      })),
    }),
    prisma.restaurant.update({
      where: { id: restaurantId },
      data: { currentStep: ONBOARDING_STEP.BUSINESS_HOURS },
    }),
  ]);

  return res.status(200).json({
    success: true,
    message: "Business hours updated successfully.",
  });
});

export const updateAddress = asyncHandler(async (req, res) => {
    let {
        addressLine,
        city,
        state,
        pincode,
        latitude,
        longitude,
    } = req.body;

    addressLine = addressLine?.trim();
    city = city?.trim();
    state = state?.trim();
    pincode = pincode?.trim();

    if (!addressLine || !city || !state || !pincode) {
        throw new api_error(
            400,
            "Address line, city, state and pincode are required."
        );
    }

    if (
        latitude !== undefined &&
        (latitude < -90 || latitude > 90)
    ) {
        throw new api_error(400, "Invalid latitude.");
    }

    if (
        longitude !== undefined &&
        (longitude < -180 || longitude > 180)
    ) {
        throw new api_error(400, "Invalid longitude.");
    }

    const updatedRestaurant = await prisma.restaurant.update({
        where: {
            id: req.restaurantId,
        },
        data: {
            addressLine,
            city,
            state,
            pincode,
            latitude,
            longitude,
            currentStep: ONBOARDING_STEP.ADDRESS,
        },
        select: {
            id: true,
            restaurantName: true,
            currentStep: true,
        },
    });

    return res.status(200).json({
        success: true,
        message: "Address updated successfully.",
        data: updatedRestaurant,
    });
});