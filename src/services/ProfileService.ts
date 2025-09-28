import { ProfileRepository } from '../repositories/UserRepository';
import { Profile, UpdateProfileRequest } from '../types';

export class ProfileService {
  private profileRepository: ProfileRepository;

  constructor() {
    this.profileRepository = new ProfileRepository();
  }

  async getProfileByUserId(userId: string): Promise<Profile | null> {
    return await this.profileRepository.findByUserId(userId);
  }

  async getPublicProfile(profileId: string): Promise<Partial<Profile> | null> {
    const profile = await this.profileRepository.findById(profileId);
    
    if (!profile) {
      return null;
    }

    // Return only public information
    return {
      id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      bio: profile.bio,
      skills: profile.skills,
      experience: profile.experience,
      education: profile.education
    };
  }

  async updateProfile(userId: string, updateData: UpdateProfileRequest): Promise<Profile> {
    const updatedProfile = await this.profileRepository.update(userId, updateData);
    
    if (!updatedProfile) {
      throw new Error('Failed to update profile');
    }

    return updatedProfile;
  }
}