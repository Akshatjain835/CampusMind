import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: String,
      enum: ['user', 'agent'],
      required: true
    },
    role: {
      type: String,
      default: 'Student'
    },
    text: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;
