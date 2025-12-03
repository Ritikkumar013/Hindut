import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { doc, setDoc, getDoc, deleteDoc, collection, getDocs,  updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getAuth } from 'firebase/auth';

// Get Firebase Storage instance
const storage = getStorage();

// export interface QuizVideo {
//   id: string;
//   quizId: string;
//   quizTitle: string;
//   videoUrl: string;
//   fileName: string;
//   filePath: string;
//   fileSize: number;
//   uploadedBy: string;
//   uploadedAt: any;
//   updatedAt?: any;
//   status: string;
//   contentType: string;
// }
export interface QuizVideo {
  id: string;
  quizId: string;
  quizTitle: string;
  videoUrl: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string | Date;
  updatedAt?: string | Date;
  status: string;
  contentType: string;
}


export const firebaseStorageService = {
  // Upload a quiz video directly to Firebase Storage
  uploadQuizVideo: async (quizId: string, videoFile: File): Promise<{ videoUrl: string; quizId: string }> => {
    try {
      console.log('[FirebaseStorageService] Starting direct upload to Firebase Storage');

      // Get current user
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      // Get quiz details
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (!quizDoc.exists()) {
        throw new Error('Quiz not found');
      }

      const quizData = quizDoc.data();

      // Create a storage reference
      const fileName = videoFile.name; // Use the original file name
      const filePath = `quizvideos/${quizId}/${fileName}`;
      const storageRef = ref(storage, filePath);

      console.log('[FirebaseStorageService] Uploading to path:', filePath);

      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, videoFile);

      // Wait for upload to complete
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('[FirebaseStorageService] Upload progress:', progress.toFixed(2) + '%');
          },
          (error) => {
            console.error('[FirebaseStorageService] Upload error:', error);
            reject(error);
          },
          () => {
            console.log('[FirebaseStorageService] Upload completed');
            resolve();
          }
        );
      });

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log('[FirebaseStorageService] Download URL:', downloadURL);

      // Save metadata to Firestore
      const videoData = {
        quizId,
        quizTitle: quizData.title || '',
        videoUrl: downloadURL,
        fileName,
        filePath,
        fileSize: videoFile.size,
        uploadedBy: user.uid,
        uploadedAt: serverTimestamp(),
        status: 'completed',
        contentType: videoFile.type
      };

      // Use quizId as the document ID
      await setDoc(doc(db, 'adminQuizVideos', quizId), videoData);
      console.log('[FirebaseStorageService] Metadata saved to Firestore');

      return {
        quizId,
        videoUrl: downloadURL
      };
    } catch (error) {
      console.error('[FirebaseStorageService] Error uploading video:', error);
      throw error;
    }
  },

  // Update an existing quiz video
  updateQuizVideo: async (quizId: string, videoFile: File): Promise<{ videoUrl: string; quizId: string }> => {
    try {
      console.log('[FirebaseStorageService] Starting video update');

      // Get current user
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      // Check if video exists
      const videoDoc = await getDoc(doc(db, 'adminQuizVideos', quizId));
      if (!videoDoc.exists()) {
        // If video doesn't exist, create a new one
        return firebaseStorageService.uploadQuizVideo(quizId, videoFile);
      }

      const existingVideo = videoDoc.data();

      // Delete existing file
      try {
        const oldFileRef = ref(storage, existingVideo.filePath);
        await deleteObject(oldFileRef);
        console.log('[FirebaseStorageService] Deleted existing file');
      } catch (error) {
        console.warn('[FirebaseStorageService] Error deleting existing file:', error);
        // Continue even if delete fails
      }

      // Get quiz details
      const quizDoc = await getDoc(doc(db, 'quizzes', quizId));
      if (!quizDoc.exists()) {
        throw new Error('Quiz not found');
      }

      const quizData = quizDoc.data();

      // Create a storage reference
      const fileName = videoFile.name; // Use the original file name
      const filePath = `quizvideos/${quizId}/${fileName}`;
      const storageRef = ref(storage, filePath);

      console.log('[FirebaseStorageService] Uploading to path:', filePath);

      // Upload the file
      const uploadTask = uploadBytesResumable(storageRef, videoFile);

      // Wait for upload to complete
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('[FirebaseStorageService] Upload progress:', progress.toFixed(2) + '%');
          },
          (error) => {
            console.error('[FirebaseStorageService] Upload error:', error);
            reject(error);
          },
          () => {
            console.log('[FirebaseStorageService] Upload completed');
            resolve();
          }
        );
      });

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);
      console.log('[FirebaseStorageService] Download URL:', downloadURL);

      // Update metadata in Firestore
      const videoData = {
        quizId,
        quizTitle: quizData.title || '',
        videoUrl: downloadURL,
        fileName,
        filePath,
        fileSize: videoFile.size,
        uploadedBy: user.uid,
        updatedAt: serverTimestamp(),
        status: 'completed',
        contentType: videoFile.type
      };

      // Update the document
      await updateDoc(doc(db, 'adminQuizVideos', quizId), videoData);
      console.log('[FirebaseStorageService] Metadata updated in Firestore');

      return {
        quizId,
        videoUrl: downloadURL
      };
    } catch (error) {
      console.error('[FirebaseStorageService] Error updating video:', error);
      throw error;
    }
  },

  // Delete a quiz video
  deleteQuizVideo: async (quizId: string): Promise<{ quizId: string }> => {
    try {
      console.log('[FirebaseStorageService] Starting video deletion');

      // Get current user
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No user logged in');
      }

      // Check if video exists
      const videoDoc = await getDoc(doc(db, 'adminQuizVideos', quizId));
      if (!videoDoc.exists()) {
        throw new Error('Video not found');
      }

      const videoData = videoDoc.data();

      // Delete file from storage
      try {
        const fileRef = ref(storage, videoData.filePath);
        await deleteObject(fileRef);
        console.log('[FirebaseStorageService] Deleted file from storage');
      } catch (error) {
        console.warn('[FirebaseStorageService] Error deleting file from storage:', error);
        // Continue even if delete fails
      }

      // Delete metadata from Firestore
      await deleteDoc(doc(db, 'adminQuizVideos', quizId));
      console.log('[FirebaseStorageService] Deleted metadata from Firestore');

      return { quizId };
    } catch (error) {
      console.error('[FirebaseStorageService] Error deleting video:', error);
      throw error;
    }
  },

  // Get all quiz videos
  getAllQuizVideos: async (): Promise<QuizVideo[]> => {
    try {
      console.log('[FirebaseStorageService] Fetching all quiz videos');

      const querySnapshot = await getDocs(collection(db, 'adminQuizVideos'));
      const videos: QuizVideo[] = [];

      querySnapshot.forEach((doc) => {
        videos.push({
          id: doc.id,
          ...doc.data()
        } as QuizVideo);
      });

      console.log('[FirebaseStorageService] Found videos:', videos.length);
      return videos;
    } catch (error) {
      console.error('[FirebaseStorageService] Error fetching videos:', error);
      return [];
    }
  },

  // Get a specific quiz video
  getQuizVideoById: async (quizId: string): Promise<QuizVideo | null> => {
    try {
      console.log('[FirebaseStorageService] Fetching video for quiz:', quizId);

      const videoDoc = await getDoc(doc(db, 'adminQuizVideos', quizId));
      if (!videoDoc.exists()) {
        console.log('[FirebaseStorageService] No video found for quiz:', quizId);
        return null;
      }

      const video = {
        id: videoDoc.id,
        ...videoDoc.data()
      } as QuizVideo;

      console.log('[FirebaseStorageService] Found video:', video);
      return video;
    } catch (error) {
      console.error('[FirebaseStorageService] Error fetching video:', error);
      return null;
    }
  }
};
