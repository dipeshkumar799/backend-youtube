import { mongoose, Schema } from "mongoose";

const suscriptionSchema = new Schema(
    {
        suscriber: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        channel: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
    }
);

export const Suscription = mongoose.model("Suscription", suscriptionSchema);
