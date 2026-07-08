import mongoose from "mongoose";

const restaurantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    restaurantName: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true,
    },

    restaurantType: {
      type: String,
      required: true,
      enum: [
        "RESTAURANT",
        "CAFE",
        "CLOUD_KITCHEN",
        "FOOD_TRUCK",
      ],
    },

    contactNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^[6-9]\d{9}$/,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fssaiNumber: {
      type: String,
      default: null,
      match: /^\d{14}$/,
    },

    establishedYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear(),
    },

    // Step 2

    addressLine: {
      type: String,
      default: null,
    },

    city: {
      type: String,
      default: null,
    },

    state: {
      type: String,
      default: null,
    },

    pincode: {
      type: String,
      default: null,
      match: /^\d{6}$/,
    },

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    cuisineTypes: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: [
        "IN_PROGRESS",
        "SUBMITTED",
        "UNDER_VERIFICATION",
        "ACTIVE",
        "REJECTED",
      ],
      default: "IN_PROGRESS",
    },

    currentStep: {
      type: Number,
      default: 1,
      min: 1,
      max: 7,
    },
  },
  {
    timestamps: true,
  }
);

// One restaurant per owner
restaurantSchema.index({ userId: 1 }, { unique: true });

// Contact number must be unique
restaurantSchema.index({ contactNumber: 1 }, { unique: true });

// Email must be unique
restaurantSchema.index({ email: 1 }, { unique: true });

// Frequently filtered by admin
restaurantSchema.index({ status: 1 });

// Resume onboarding
restaurantSchema.index({ currentStep: 1 });

// Search restaurants by city
restaurantSchema.index({ city: 1 });

// Search restaurants by restaurant type
restaurantSchema.index({ restaurantType: 1 });

// Cuisine search
restaurantSchema.index({ cuisineTypes: 1 });

export default mongoose.model("Restaurant", restaurantSchema);