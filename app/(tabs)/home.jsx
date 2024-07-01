import {  FlatList, Image, RefreshControl, Text, View } from 'react-native'
import {Tabs,Redirect} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {images} from '../../constants'
import SearchInput from '../../components/SearchInput';
import Trending from '../../components/Trending';
import EmptyState from '../../components/EmptyState';
import { useEffect, useState } from 'react';
import { getAllPosts, getLatestPosts } from '../../lib/appwrite';
import useAppwrite from '../../lib/useAppwrite';
import VideoCard from '../../components/VideoCard';
import { useGlobalContext } from '../../context/GlobalProvider';

const home = () => {
  const {user}=useGlobalContext();
  const {data:posts,refetch}=useAppwrite(getAllPosts);
  const {data:latestPosts}=useAppwrite(getLatestPosts);
  //console.log(posts);
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  
  return (
    <SafeAreaView className="bg-primary h-full">
      <FlatList
      data={posts}
      keyExtractor={(item)=>item.$id}
      renderItem={({item})=>(
        <VideoCard
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            creator={item.creator.username}
            avatar={item.creator.avatar}
          />
      )}
      ListHeaderComponent={()=>(
        <View className="my-6 px-4 space-y-6">
          <View className="justify-between items-start flex-row mb-6">
            <View>
              <Text className="font-pmedium text-sm text-gray-100">
                Welcome Back,
              </Text>
              <Text className="font-pmedium text-sm text-gray-100">
                {user?.username}
              </Text>
            </View>
            <View className="mt-1.5">
              <Image source={images.logoSmall}
              className="w-9 h-10"
              resizeMode='contain'
              ></Image>

            </View>
          </View>
          <SearchInput/>
          <View className='w-full flex-1 pt-5 pb-8'>
            <Text className="text-gray-100 text-lg mb-3 font-pregular">Latest Videos</Text>
            <Trending posts={latestPosts??[]}></Trending>
          </View>
        </View>
      )}
      ListEmptyComponent={() => (
        <EmptyState
          title="No Videos Found"
          subtitle="No videos created yet"
        />
      )}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  </SafeAreaView>
  )
}

export default home

