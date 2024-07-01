import { Account, Avatars, Client, Databases, Query, Storage } from 'react-native-appwrite';
import { ID } from 'react-native-appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.jsm.visual',
    projectId: '667d36a4003bf6ddfe5a',
    databaseId: '667d39340002c9d0ee18',
    userCollectionId: '667d396d003caec90559',
    videoCollectionId: '667d39b4001ffe20edd4',
    storageId: '667d3b78001b1bae6daa'
}

const client = new Client();
client
    .setEndpoint(config.endpoint)
    .setProject(config.projectId)
    .setPlatform(config.platform)

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const getFilePreview = async (fileId, type) => {
    let fileUrl;
    try {
        if (type === 'video') {
            fileUrl = storage.getFileView(config.storageId, fileId);
        } else if (type === 'image') {
            fileUrl = storage.getFilePreview(config.storageId, fileId, 2000, 2000, 'top', 100);
        } else {
            throw new Error('Invalid file type');
        }

        if (!fileUrl) throw new Error('Error retrieving file URL');

        return fileUrl;
    } catch (error) {
        throw new Error(error.message);
    }
}
export const uploadFile = async (file, type) => {
    if (!file) return;
    const { mimeType, ...rest } = file;
    const asset = {
        name: file.fileName,
        type: file.mimeType,
        size: file.fileSize,
        uri: file.uri
    }

    try {
        const uploadedFile = await storage.createFile(
            config.storageId,
            ID.unique(),
            asset
        );
        const fileUrl = await getFilePreview(uploadedFile.$id, type);
        return fileUrl;
    } catch (error) {
        throw new Error(error.message);
    }
}
export const createVideo = async (form) => {
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([
            uploadFile(form.thumbnail, 'image'),
            uploadFile(form.video, 'video')
        ]);

        //console.log('Creating document with databaseId:', config.databaseId);
        //console.log('videoCollectionId:', config.videoCollectionId);

        const newPost = await databases.createDocument(
            config.databaseId, 
            config.videoCollectionId, 
            ID.unique(), 
            {
                title: form.title,
                thumbnail: thumbnailUrl,
                video: videoUrl,
                prompt: form.prompt,
                creator: form.userId
            }
        );

        return newPost;
    } catch (error) {
        throw new Error(error.message);
    }
}
export const createUser = async (email, password, username) => {
    try {
        const newAccount = await account.create(
            ID.unique(),
            email,
            password,
            username
        );
        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username);

        const newUser = await databases.createDocument(
            config.databaseId,
            config.userCollectionId,
            ID.unique(),
            {
                accountId: newAccount.$id,
                email,
                username,
                avatar: avatarUrl
            }
        );

        // Automatically sign in the user after creation
        await signIn(email, password);
        //console.log(newUser);
        return newUser;
    } catch (err) {
        console.log(err);
        throw new Error(err);
    }
}
export async function signIn(email, password) {
    try {
      const currentSession = await AsyncStorage.getItem('currentSession');
      if (currentSession) return JSON.parse(currentSession);
  
      const newSession = await account.createEmailPasswordSession(email, password);
      await AsyncStorage.setItem('currentSession', JSON.stringify(newSession));
      return newSession;
    } catch (error) {
      throw new Error(error.message);
    }
}
export const getCurrentUser = async () => {
    try {
      const currentSession = await AsyncStorage.getItem('currentSession');
      if (!currentSession) throw new Error('No active session found');
  
      const sessionData = JSON.parse(currentSession);
  
      if (sessionData && sessionData.$id) {
        const currentAccount = await account.get();
        if (!currentAccount) throw new Error('Failed to get current account');
  
        const currentUser = await databases.listDocuments(
          config.databaseId,
          config.userCollectionId,
          [Query.equal('accountId', currentAccount.$id)]
        );
  
        if (!currentUser || currentUser.total === 0) throw new Error('User not found');
        return currentUser.documents[0];
      } else {
        throw new Error('Invalid session data');
      }
    } catch (error) {
      console.log(error);
      throw new Error(error.message);
    }
}
export async function getAllPosts() {
    try {
      const posts = await databases.listDocuments(
        config.databaseId,
        config.videoCollectionId
      );
  
      return posts.documents;
    } catch (error) {
      throw new Error(error);
    }
}
export const getLatestPosts = async () => {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.orderDesc('$createdAt', Query.limit(7))]
        );
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}
export const searchPosts = async (query) => {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.search('title', query)]
        );
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}
export const getUserPosts = async (userId) => {
    try {
        const posts = await databases.listDocuments(
            config.databaseId,
            config.videoCollectionId,
            [Query.equal('creator', userId)],Query.orderDesc('$createdAt')
        );
        return posts.documents;
    } catch (error) {
        throw new Error(error);
    }
}
export const signOut = async () => {
    try {
      await AsyncStorage.removeItem('currentSession');
      await account.deleteSession('current');
      
      return true; 
    } catch (error) {
      throw new Error(error.message);
    }
};
