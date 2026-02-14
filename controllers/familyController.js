import FamilyProfile from "../models/familyProfile.js";

// Create Family Profile
export const createFamilyProfile = async (req, res) => {
  try {
    const {
      fullName,
      age,
      gender,
      phone,
      emergencyContact,
      livingAddress,
      bloodGroup,
      allergies,
      mobilityLevel,
      chronicConditions,
      currentMedicines,
      notes,
    } = req.body;

    // Basic validation
    if (!fullName || !age || !gender) {
      return res.status(400).json({ message: "Full name, age and gender are required" });
    }

    const profile = await FamilyProfile.create({
      client: req.user._id,
      photo: req.file ? req.file.filename : null,

      fullName,
      age: Number(age),
      gender,

      phone,
      emergencyContact,
      livingAddress,

      bloodGroup,
      allergies,

      mobilityLevel: mobilityLevel || "NONE",

      chronicConditions: chronicConditions
        ? Array.isArray(chronicConditions)
          ? chronicConditions
          : JSON.parse(chronicConditions)
        : [],

      currentMedicines: currentMedicines
        ? Array.isArray(currentMedicines)
          ? currentMedicines
          : JSON.parse(currentMedicines)
        : [],

      notes,
    });

    res.status(201).json(profile);
  } catch (error) {
    console.error("CREATE FAMILY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get All Family Profiles for logged-in client
export const getFamilyProfiles = async (req, res) => {
  try {
    const profiles = await FamilyProfile.find({
      client: req.user._id,
    }).sort({ createdAt: -1 });

    res.json(profiles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Family Profile by ID
export const getFamilyProfileById = async (req, res) => {
  try {
    const profile = await FamilyProfile.findOne({
      _id: req.params.id,
      client: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Family Profile
export const updateFamilyProfile = async (req, res) => {
  try {
    const {
      fullName,
      age,
      gender,
      phone,
      emergencyContact,
      livingAddress,
      bloodGroup,
      allergies,
      mobilityLevel,
      chronicConditions,
      currentMedicines,
      notes,
    } = req.body;

    // Find profile and ensure ownership
    const profile = await FamilyProfile.findOne({
      _id: req.params.id,
      client: req.user._id,
    });

    if (!profile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    if (fullName !== undefined) profile.fullName = fullName;
    if (age !== undefined) profile.age = Number(age);
    if (gender !== undefined) profile.gender = gender;

    if (phone !== undefined) profile.phone = phone;
    if (emergencyContact !== undefined) profile.emergencyContact = emergencyContact;
    if (livingAddress !== undefined) profile.livingAddress = livingAddress;

    if (bloodGroup !== undefined) profile.bloodGroup = bloodGroup;
    if (allergies !== undefined) profile.allergies = allergies;

    if (mobilityLevel !== undefined) profile.mobilityLevel = mobilityLevel;

    if (chronicConditions !== undefined) {
      profile.chronicConditions = Array.isArray(chronicConditions)
        ? chronicConditions
        : chronicConditions
        ? JSON.parse(chronicConditions)
        : [];
    }

    if (currentMedicines !== undefined) {
      profile.currentMedicines = Array.isArray(currentMedicines)
        ? currentMedicines
        : currentMedicines
        ? JSON.parse(currentMedicines)
        : [];
    }

    if (notes !== undefined) profile.notes = notes;

    // Update photo only if a new one was uploaded
    if (req.file) {
      profile.photo = req.file.filename;
    }

    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error("UPDATE FAMILY ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// Delete Family Profile
export const deleteFamilyProfile = async (req, res) => {
  try {
    const deleted = await FamilyProfile.findOneAndDelete({
      _id: req.params.id,
      client: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({ message: "Profile not found" });
    }

    res.json({ message: "Profile deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};