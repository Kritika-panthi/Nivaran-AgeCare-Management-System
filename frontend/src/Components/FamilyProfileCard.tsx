import { Trash2, Edit } from "lucide-react";

// Define the props for the FamilyProfileCard component
type Props = {
  profile: any;
  onDelete: (id: string) => void;
  onEdit: (profile: any) => void;
};

const FamilyProfileCard = ({ profile, onDelete, onEdit }: Props) => {
  return (
    <div className="bg-white rounded-3xl shadow-md p-6 flex items-center justify-between hover:shadow-lg transition">

      {/* Profile image and info */}
      <div className="flex items-center gap-6">
        <img
          src={
            profile.photo
              ? `http://localhost:3000/uploads/${profile.photo}`
              : "/default-avatar.png"
          }
          className="w-20 h-20 rounded-full object-cover"
        />

        {/* Profile details */}
        <div>
          <h3 className="text-lg font-bold">{profile.fullName}</h3>
          <p className="text-sm text-gray-500">
            {profile.age} yrs • {profile.gender}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {profile.mobilityLevel}
          </p>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => onEdit(profile)}
          className="p-3 rounded-xl border hover:bg-gray-100"
        >
          <Edit size={18} />
        </button>

        {/* Delete button */}
        <button
          onClick={() => onDelete(profile._id)}
          className="p-3 rounded-xl border hover:bg-red-50 text-red-600"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default FamilyProfileCard;