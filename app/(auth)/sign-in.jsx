import { ScrollView, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import {images} from '../../constants';
import { SafeAreaView } from 'react-native-safe-area-context'
import { Image } from 'react-native';
import FormField from '../../components/FormField';
import { useState } from 'react';
import CustomButton from '../../components/CustomButton' 
import { Link } from 'expo-router';
import { getCurrentUser, signIn } from '../../lib/appwrite';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { useGlobalContext } from "../../context/GlobalProvider";

const Signin = () => {
  const { setUser, setIsLoggedIn } = useGlobalContext();
  const [isSubmitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const submit = async () => {
    if (form.email === "" || form.password === "") {
        Alert.alert("Error", "Please fill in all fields");
        return;
    }

    setSubmitting(true);

    try {
        await signIn(form.email, form.password);
        const result = await getCurrentUser();
        //console.log(result);
        setUser(result);
        setIsLoggedIn(true);

        Alert.alert("Success", "User signed in successfully");
        router.replace("/home");
    } catch (error) {
        Alert.alert("Error", error.message);
    } finally {
        setSubmitting(false);
    }
};


  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center h-full px-4 my-6">
          <Image source={images.logo} resizeMode='contain' className="w-[115px] h=[35px]"/>
           <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">Log in to Visual</Text> 
           <FormField 
            title="Email"
            value={form.email}
            handleChangeText={(e)=>setForm({...form,email:e})}
            otherStyles="mt-7"
            keyboardType="email-address"
           />
           <FormField 
            title="Password"
            value={form.password}
            handleChangeText={(e)=>setForm({...form,password:e})}
            otherStyles="mt-7"
           />
           <CustomButton title="Login" 
           handlePress={submit}
           containerStyles="mt-7"
           isLoading={isSubmitting}    
           />
           <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't Have Account?
            </Text>
            <Link href="/sign-up" className='text-lg font-psemibold text-secondary'>Sign-up</Link>
           </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Signin

const styles = StyleSheet.create({})