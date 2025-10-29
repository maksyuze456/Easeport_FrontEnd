'use client';

import Hero from "@/components/hero-home";
import BusinessCategories from "@/components/business-categories";
import FeaturesPlanet from "@/components/features-planet";
import LargeTestimonial from "@/components/large-testimonial";

import { useAuthContext } from "../_context/AuthProvider";
import { Center, Loader } from "@mantine/core";

export default function Home() {

  const { loggedInUser, loading } = useAuthContext();

  if (loading) {
    return (
      <Center h="100vh">
        <Loader/>
      </Center>
    );
  };

  return (
    <>
      <Hero />
      <BusinessCategories />
      <FeaturesPlanet />
 
    </>
  );
}
