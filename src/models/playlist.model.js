import {Mongoose, Schema} from "mongoose";

const PlaylistSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            trim: true,
            maxlength: 500,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        videos: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video',
            },
        ],
    },
    { timestamps: true }
);

export const Playlist = Mongoose.model('Playlist', PlaylistSchema);