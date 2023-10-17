import { StatusBar } from "expo-status-bar";
import { SafeAreaView, Text, View, Image, TextInput, TouchableOpacity, ScrollView } from "react-native"
import { theme } from '../theme'
import { useCallback, useEffect, useState } from "react"
import { debounce } from 'lodash'
import { ICON_MAP } from '../logic/addMapping'
import { weatherImages, days } from "../constants"
import Spinner from 'react-native-loading-spinner-overlay'

import { MagnifyingGlassIcon } from 'react-native-heroicons/outline'
import { MapPinIcon, CalendarDaysIcon } from 'react-native-heroicons/solid'
import getCityCoordinates from "../logic/getCityCoordinates"
import getForecast from "../logic/getForecast"
import { retrieveData, storeData } from "../utils/asyncStorage"

export default function HomeScreen() {
    const [search, setSearch] = useState(false)
    const [city, setCity] = useState({})
    const [pickedCity, setPickedCity] = useState({})
    const [data, setData] = useState({})
    const [suggestion, setSuggestion] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        try {
            (async () => {
                const cityStored = await retrieveData('city')

                console.log(cityStored)

                let cityName = 'barcelona'
                if (cityStored) cityName = cityStored

                console.log(cityName)

                getCityCoordinates(cityName).then(city => {
                    if (!city) {
                        throw new Error('city not found')
                    }
                    setPickedCity(city)

                    getForecast(city.lat, city.lon).then(res => {
                        setData(res)
                        setLoading(false)
                    }).catch(error => {
                        console.log(error.message)
                        setLoading(false)
                    })
                }).catch(error => {
                    console.log(error.message)
                    setLoading(false)
                })
            })()
        } catch (error) {
            console.log(error.message)
            setLoading(false)
        }
    }, [])

    const handleSearch = async (value) => {
        try {
            if (value.length > 2) {
                getCityCoordinates(value).then(city => {
                    if (!city) {
                        throw new Error('city not found')
                    }

                    setCity(city)
                    setSuggestion(true)
                }).catch(error => {
                    console.log(error.message)
                })
            } else {
                setSuggestion(false)
                setCity({})
            }
        } catch (error) {
            console.log(error.message)
        }
    }

    const handleLocation = () => {
        setLoading(true)
        setSearch(false)
        setSuggestion(false)
        setPickedCity(city)
        storeData('city', city.name)
        getForecast(city.lat, city.lon).then(res => {
            setData(res)
            setLoading(false)
        }).catch(error => {
            console.log(error.message)
            setLoading(false)
        })
    }

    const handleSearchDebounce = useCallback(debounce(handleSearch, 200), [])

    return (
        <View className="flex-1 relative" >
            <StatusBar style="light" />
            <Image blurRadius={70} className="absolute h-full w-full" source={require('../assets/images/sky.jpg')} />

            {loading && (
                <View className="h-full w-full flex-row flex-1 justify-center items-center">
                    <Spinner
                        visible={true}
                    />
                </View>
            )}

            {!loading && <SafeAreaView className="flex flex-1" >
                <View style={{ height: '7%' }} className="mx-4 relative z-50">
                    <View className="flex-row justify-end items-center rounded-full mt-2"
                        style={{ backgroundColor: search ? theme.bgWhite(0.2) : 'transparent' }}
                    >
                        {search && <TextInput
                            placeholder="Search city..."
                            placeholderTextColor={'lightgray'}
                            className="pl-6 pb-1 h-10 flex-1 text-base text-white"
                            onChangeText={handleSearchDebounce}
                        />}
                        <TouchableOpacity
                            onPress={() => setSearch(!search)}
                            style={{ backgroundColor: theme.bgWhite(0.3) }}
                            className="rounded-full p-3 m-1"
                        >
                            <MagnifyingGlassIcon size="25" color="white" />
                        </TouchableOpacity>
                    </View>

                    {
                        search && suggestion && city && (
                            <TouchableOpacity
                                onPress={() => handleLocation()}
                                className={`flex-row items-center border-0 p-3 px-4 mb-1 bg-slate-100 mt-2 rounded-3xl`}
                            >
                                <MapPinIcon size={20} color='gray' />
                                {city.name && city.country && <Text className="text-black text-lg ml-2 leading-5" >{city.name}, {city.country}</Text>}
                            </TouchableOpacity>)
                    }
                </View>
                <View className="mx-4 mt-4 flex flex-1 justify-around items-center mb-2">
                    {pickedCity && <Text className="text-slate-100 drop-shadow-[0_4px_3px_rgba(0,0,0,1)] text-3xl font-medium" >
                        {pickedCity.name},
                        <Text className="text-slate-200 drop-shadow-lg text-xl" >
                            {' '}{pickedCity.country}
                        </Text>
                    </Text>}
                    <View className="flex-row justify-center" >
                        {data.current_weather && <Image
                            source={weatherImages[ICON_MAP.get(data.current_weather.weathercode)[0]]}
                            className="h-52 w-52"
                        />}
                        <Text>{ }</Text>
                    </View>
                    <View className="space-y-1">
                        {data.current_weather && <Text className="text-center font-bold text-slate-100 drop-shadow-lg text-6xl ml-5" >
                            {data.current_weather.temperature}&#176;
                        </Text>}
                        {data.current_weather && <Text className="text-center text-slate-100 text-xl tracking-widest ml-5 font-semibold" >
                            {ICON_MAP.get(data.current_weather.weathercode)[1]}
                        </Text>}
                    </View>
                    <View className="flex-row w-full justify-between px-4">
                        <View className="flex-row gap-2">
                            <Image source={require('../assets/icons/wind.png')} className="h-6 w-6" />
                            {data.current_weather && <Text className="text-center text-slate-100 text-lg ml-5 font-semibold" >
                                {data.current_weather.windspeed}km
                            </Text>}
                        </View>
                        <View className="flex-row gap-2">
                            <Image source={require('../assets/icons/drop.png')} className="h-6 w-6" />
                            {data.hourly && <Text className="text-center text-slate-100 text-lg ml-5 font-semibold" >
                                {data.hourly.relativehumidity_2m[0]}%
                            </Text>}
                        </View>
                        <View className="flex-row gap-2">
                            <Image source={require('../assets/icons/rain.png')} className="h-6 w-6" />
                            {data.hourly && <Text className="text-center text-slate-100 text-lg ml-5 font-semibold" >
                                {data.hourly.precipitation_probability[0]}%
                            </Text>}
                        </View>
                    </View>
                </View>
                <View className="flex-col w-full gap-3 pb-4">
                    <View className="flex-row items-center w-full px-4 gap-2 text-base " >
                        <CalendarDaysIcon size="22" color="white" />
                        <Text className="text-slate-100" >Daily forecast</Text>
                    </View>
                    <ScrollView
                        horizontal
                        contentContainerStyle={{ paddingHorizontal: 10 }}
                        showsHorizontalScrollIndicator={false}
                        className="flex-initial"
                    >

                        {
                            data.daily && data.daily.time.map((date, index) => {
                                const day = new Date(date)
                                return (
                                    <View key={index} className="bg-slate-400/25 py-3 w-24 rounded-3xl justify-center items-center space-y-1 mr-4" >
                                        <Image
                                            source={weatherImages[ICON_MAP.get(data.daily.weathercode[index])[0]]}
                                            className="h-10 w-10"
                                        />
                                        <Text className="text-slate-100 font-medium text-sm" >{days[day.getDay()]}</Text>
                                        <Text className="text-slate-100 font-medium text-xl font-semibold " >{data.daily.temperature_2m_max[index]}&#176;</Text>
                                    </View>
                                )
                            })
                        }
                    </ScrollView>
                </View>
            </SafeAreaView>}
        </View>
    )
}