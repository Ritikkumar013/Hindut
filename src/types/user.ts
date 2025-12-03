export interface User {
    id: string;
    uid: string; // Add uid to match Firebase User
    email: string;
    name?: string; // Added name property
    phoneNumber?: string;
    createdAt: Date;
    type: string; // Added the 'type' property
  }