export interface DonationData {
  title: string;
  category: string;
  quantity: string;
  expiry: string;
  dietaryTags: string[];
  instructions: string;
}

// Replace with your actual backend URL or environment variable
const API_BASE_URL = 'http://localhost:3000/api'; 

export const createDonation = async (data: DonationData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to create donation');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating donation:', error);
    throw error;
  }
};
