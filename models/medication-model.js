import mongoose from 'mongoose'

const MedicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    firstReminder: {
        type: Number,
        required: true
    },
    days: {
        type: Object,
        required: true
    },
    taken: {
        type: Boolean,
        required: true
    },
    nextReminder: {
        type: Number,
        required: true
    },
    lastReminder: {
        type: Number,
        required: true
    }
});

const Medications = mongoose.model('Medications', MedicationSchema);

module.exports = Medications;
