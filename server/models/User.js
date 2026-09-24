const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    // Simple login "ID" (no email needed) - e.g. "rahul" or "rahul123"
    userId: { type: String, required: true, unique: true, lowercase: true, trim: true, minlength: [3, 'User ID must be at least 3 characters'] },
    password: { type: String, required: true, minlength: [4, 'Password must be at least 4 characters'] },
    phone: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

// Hash the password (bcrypt) before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};
userSchema.methods.toSafe = function () {
  return { _id: this._id, name: this.name, userId: this.userId, phone: this.phone, role: this.role, createdAt: this.createdAt };
};

module.exports = mongoose.model('User', userSchema);
