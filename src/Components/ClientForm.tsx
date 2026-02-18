import { Input } from "../Components/Form";
import FileUpload from "../Components/FileUpload";

type ClientFormData = {
  fullName: string;
  occupation: string;
  dob: string;
  gender: string;
  phone: string;
  email: string;
  password?: string;
  currentLocation: string;
  permanentAddress: string;
 profilePhoto: File | string | null;
};

type Props = {
  formData: ClientFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onGenderChange: (value: string) => void;
  onFileSelect: (file: File | null) => void;
  showPassword?: boolean;
};

const ClientForm = ({
  formData,
  onChange,
  onGenderChange,
  onFileSelect,
  showPassword = false,
}: Props) => {
  return (
    <>
      <div className="mb-12">
        <FileUpload
            label="PROFILE PHOTO"
            variant="circle"
            onFileSelect={onFileSelect}
            existingImage={
                typeof formData.profilePhoto === "string"
                ? formData.profilePhoto
                : null
            }
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input label="FULL NAME" name="fullName" value={formData.fullName} onChange={onChange} />
        <Input label="OCCUPATION" name="occupation" value={formData.occupation} onChange={onChange} />
        <Input label="DATE OF BIRTH" type="date" name="dob" value={formData.dob} onChange={onChange} />

        <div>
          <label className="block text-xs font-semibold tracking-wide mb-2">
            GENDER
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={(e) => onGenderChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#4b5244]"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <Input label="PHONE NUMBER" name="phone" value={formData.phone} onChange={onChange} />
        <Input label="EMAIL ADDRESS" type="email" name="email" value={formData.email} onChange={onChange} />

        {showPassword && (
          <Input
            label="PASSWORD"
            type="password"
            name="password"
            value={formData.password || ""}
            onChange={onChange}
          />
        )}

        <Input
          label="CURRENT LOCATION"
          name="currentLocation"
          value={formData.currentLocation}
          onChange={onChange}
        />

        <div className="md:col-span-2">
          <Input
            label="PERMANENT ADDRESS"
            name="permanentAddress"
            value={formData.permanentAddress}
            onChange={onChange}
          />
        </div>
      </div>
    </>
  );
};

export default ClientForm;