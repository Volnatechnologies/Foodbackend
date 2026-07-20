import multer from "multer";
import { api_error } from "../utils/errorHandler.js";

const FIELD_RULES = {
  fssaiCertificate: { mimes: ["application/pdf"], maxSize: 10 * 1024 * 1024 },
  gstCertificate: { mimes: ["application/pdf"], maxSize: 10 * 1024 * 1024 },
  logo: { mimes: ["image/jpeg", "image/png", "image/webp"], maxSize: 5 * 1024 * 1024 },
  banner: { mimes: ["image/jpeg", "image/png", "image/webp"], maxSize: 5 * 1024 * 1024 },
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const rule = FIELD_RULES[file.fieldname];
    if (!rule) {
      return cb(new api_error(400, `Unexpected field "${file.fieldname}".`));
    }
    if (!rule.mimes.includes(file.mimetype)) {
      const allowed = rule.mimes.join(", ");
      return cb(
        new api_error(
          400,
          `Invalid file type "${file.mimetype}" for "${file.fieldname}". Allowed: ${allowed}.`
        )
      );
    }
    cb(null, true);
  },
});
