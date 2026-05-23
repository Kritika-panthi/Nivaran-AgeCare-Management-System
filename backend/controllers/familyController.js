import axios from "axios";
import FamilyProfile from "../models/familyProfile.js";

const geocodeAddress = async (address) => {
  if (!address || !address.trim()) return null;

  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: address,
        format: "jsonv2",
        limit: 1,
        addressdetails: 1,
      },
      headers: {
        "User-Agent": "Nivaran-AgeCare-Management-System/1.0 (student-project)",
        Accept: "application/json",
      },
      timeout: 15000,
    }
  );

  if (!Array.isArray(response.data) || response.data.length === 0) {
    return null;
  }

  const first = response.data[0];
  const lat = Number(first.lat);
  const lng = Number(first.lon);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return { lat, lng };
};

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
      parentLocation,
    } = req.body;

    if (!fullName || !age || !gender) {
      return res
        .status(400)
        .json({ message: "Full name, age and gender are required" });
    }

    if (!livingAddress || !livingAddress.trim()) {
      return res
        .status(400)
        .json({ message: "Living address is required for family profile" });
    }

    let finalLocation = null;

    if (parentLocation) {
      const parsed = JSON.parse(parentLocation);
      if (
        typeof parsed.lat === "number" &&
        typeof parsed.lng === "number"
      ) {
        finalLocation = parsed;
      }
    }

    if (!finalLocation) {
      finalLocation = await geocodeAddress(livingAddress);
    }

    if (!finalLocation) {
      return res.status(400).json({
        message:
          "Could not determine parent house location. Please select it again on the map.",
      });
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
      parentLocation: finalLocation,
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
      parentLocation,
    } = req.body;

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
    if (emergencyContact !== undefined) {
      profile.emergencyContact = emergencyContact;
    }

    if (livingAddress !== undefined) {
      profile.livingAddress = livingAddress;
    }

    let finalLocation = null;

    // PRIORITY 1 → use map location
    if (parentLocation) {
      try {
        const parsed = JSON.parse(parentLocation);

        if (
          typeof parsed.lat === "number" &&
          typeof parsed.lng === "number"
        ) {
          finalLocation = parsed;
        } else {
          console.log("Invalid lat/lng format:", parsed);
        }
      } catch (err) {
        console.log("Failed to parse parentLocation:", parentLocation);
      }
    }

    // PRIORITY 2 → fallback to geocode
    if (!finalLocation && livingAddress && livingAddress.trim()) {
      finalLocation = await geocodeAddress(livingAddress);
    }

    if (!finalLocation) {
      return res.status(400).json({
        message: "Could not determine parent location",
      });
    }

    profile.parentLocation = finalLocation;

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