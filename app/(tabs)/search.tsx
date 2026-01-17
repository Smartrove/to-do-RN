import MovieCard from "@/components/MovieCard";
import SearchBar from "@/components/serachbar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchPopularMovies } from "@/services/api";
import { updateSearch } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    data: movies,
    loading: moviesLoading,
    error: moviesError,
    refetch: reloadMovies,
    reset,
  } = useFetch(() => fetchPopularMovies({ query: searchQuery }), false);

  // useEffect(() => {
  //   const func = async () => {
  //     if (searchQuery.trim()) {
  //       await reloadMovies();
  //     } else {
  //       reset();
  //     }
  //   };

  //   func();
  // }, [searchQuery]);

  // First useEffect: Handle search
  useEffect(() => {
    const timeOutId = setTimeout(async () => {
      if (searchQuery.trim()) {
        await reloadMovies();
      } else {
        reset();
      }
    }, 500);

    return () => clearTimeout(timeOutId);
  }, [searchQuery]);

  // Second useEffect: Update database when movies change
  useEffect(() => {
    const updateDatabase = async () => {
      if (
        searchQuery.trim() &&
        movies?.results?.length > 0 &&
        movies?.results[0]
      ) {
        try {
          await updateSearch(searchQuery, movies.results[0]);
        } catch (err) {
          console.error("Failed to update search:", err);
        }
      }
    };

    updateDatabase();
  }, [movies]); // Trigger when movies data changes

  return (
    <View className="flex-1 bg-primary">
      <Image
        source={images.bg}
        className="flex-1 absolute w-full z-0 "
        resizeMode="cover"
      />
      <FlatList
        // horizontal
        showsHorizontalScrollIndicator={false}
        className="pb-32 mt-2"
        data={movies?.results || []}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        renderItem={({ item, index }) => <MovieCard {...item} />}
        keyExtractor={(item) => item.id?.toString()}
        numColumns={3}
        key={movies?.results?.length}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          gap: 20,
          paddingRight: 5,
          marginBottom: 10,
        }}
        ListHeaderComponent={
          <>
            <View className="w-full flex-row justify-center mt-20 items-center">
              <Image source={icons.logo} className="w-12 h-10" />
            </View>
            <View className="my-5">
              <SearchBar
                placeholder="search movies..."
                value={searchQuery}
                onChangeText={(text: string) => setSearchQuery(text)}
              />

              {moviesLoading && (
                <>
                  <ActivityIndicator
                    size={"large"}
                    color={"#0000ff"}
                    className="my-3"
                  />
                </>
              )}
              {moviesError && (
                <>
                  <Text className="text-red-500 px-5 my-3">
                    {moviesError.message}
                  </Text>
                </>
              )}
              {!moviesLoading &&
                !moviesError &&
                searchQuery.trim() &&
                movies?.results?.length > 0 && (
                  <Text className="text-xl text-white font-bold">
                    Search results for: {"  "}{" "}
                    <Text className="text-accent">{searchQuery}</Text>
                  </Text>
                )}
            </View>
          </>
        }
        scrollEnabled={false}
        ListEmptyComponent={
          !moviesLoading && !moviesError ? (
            <View className="mt-10 px-5">
              <Text className="text-center text-gray-500">
                {" "}
                {searchQuery.trim() ? "No movies found" : "Search for a movie"}
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

export default Search;
