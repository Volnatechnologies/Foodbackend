import mongoose from "mongoose";

const businessHourSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    dayOfWeek: {
      type: String,
      required: true,
      enum: [
        "MONDAY",
        "TUESDAY",
        "WEDNESDAY",
        "THURSDAY",
        "FRIDAY",
        "SATURDAY",
        "SUNDAY",
      ],
    },

    openTime: {
      type: String,
      default: null,
    },

    closeTime: {
      type: String,
      default: null,
    },

    closed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate entries for the same restaurant/day
businessHourSchema.index(
  { restaurantId: 1, dayOfWeek: 1 },
  { unique: true }
);

// Only one record per restaurant per day
businessHourSchema.index(
    { restaurantId: 1, dayOfWeek: 1 },
    { unique: true }
);

// Find all business hours of a restaurant
businessHourSchema.index({ restaurantId: 1 });

export default mongoose.model("BusinessHour", businessHourSchema);