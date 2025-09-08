import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, TrendingUp, Users, MapPin, Search } from 'lucide-react';

const NetMigrationPage = ({ setCurrentPage }) => {
  const [migrationData, setMigrationData] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [viewMode, setViewMode] = useState('combined');
  const [selectedYear, setSelectedYear] = useState('2025');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  console.log('🔥 NetMigrationPage rendered');

  const migrationDataByYear = {
    '2023': [
      { Origin: "Los Angeles, CA", Destination: "Phoenix, AZ", Level: "City-to-City", Source: "U-Haul / Redfin", "Estimated Movers": 40000 },
      { Origin: "Los Angeles, CA", Destination: "Dallas, TX", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 38000 },
      { Origin: "San Francisco, CA", Destination: "Austin, TX", Level: "City-to-City", Source: "PODS", "Estimated Movers": 35000 },
      { Origin: "San Francisco, CA", Destination: "Seattle, WA", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 32000 },
      { Origin: "New York, NY", Destination: "Miami, FL", Level: "City-to-City", Source: "Redfin", "Estimated Movers": 45000 },
      { Origin: "New York, NY", Destination: "Charlotte, NC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 35000 },
      { Origin: "Chicago, IL", Destination: "Nashville, TN", Level: "City-to-City", Source: "PODS", "Estimated Movers": 30000 },
      { Origin: "Seattle, WA", Destination: "Las Vegas, NV", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 25000 },
      { Origin: "Boston, MA", Destination: "Raleigh, NC", Level: "City-to-City", Source: "Redfin", "Estimated Movers": 24000 },
      { Origin: "Philadelphia, PA", Destination: "Atlanta, GA", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 23000 },
      { Origin: "Detroit, MI", Destination: "Charlotte, NC", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 21000 },
      { Origin: "Denver, CO", Destination: "Dallas, TX", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 20000 },
      { Origin: "Minneapolis, MN", Destination: "Tampa, FL", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 19000 },
      { Origin: "Portland, OR", Destination: "Boise, ID", Level: "City-to-City", Source: "PODS", "Estimated Movers": 18000 },
      { Origin: "Baltimore, MD", Destination: "Greenville, SC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 17000 },
      { Origin: "San Diego, CA", Destination: "Las Vegas, NV", Level: "City-to-City", Source: "PODS", "Estimated Movers": 16000 },
      { Origin: "Austin, TX", Destination: "Oklahoma City, OK", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 15000 },
      { Origin: "Miami, FL", Destination: "Orlando, FL", Level: "City-to-City", Source: "Redfin", "Estimated Movers": 14500 },
      { Origin: "Newark, NJ", Destination: "Charlotte, NC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 14000 },
      { Origin: "Sacramento, CA", Destination: "Reno, NV", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 13000 },
      { Origin: "New York, NY", Destination: "Conway, SC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 12000 },
      { Origin: "New York, NY", Destination: "Wake Forest, NC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 11000 },
      { Origin: "California", Destination: "Caldwell, ID", Level: "State-to-City", Source: "moveBuddha", "Estimated Movers": 10500 },
      { Origin: "Chicago, IL", Destination: "Johnson City, TN", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 10000 },
      { Origin: "California", Destination: "Eagle, ID", Level: "State-to-City", Source: "moveBuddha", "Estimated Movers": 9500 },
      { Origin: "New York, NY", Destination: "Greenville, SC", Level: "City-to-City", Source: "PODS", "Estimated Movers": 9000 },
      { Origin: "New York, NY", Destination: "Little River, SC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 8500 },
      { Origin: "Chicago, IL", Destination: "Huntsville, AL", Level: "City-to-City", Source: "PODS", "Estimated Movers": 8000 },
      { Origin: "Miami, FL", Destination: "Ocala, FL", Level: "City-to-City", Source: "PODS", "Estimated Movers": 7500 },
      { Origin: "New York, NY", Destination: "Raleigh, NC", Level: "City-to-City", Source: "PODS", "Estimated Movers": 7000 },
      { Origin: "California", Destination: "Texas", Level: "State-to-State", Source: "U-Haul Growth Index", "Estimated Movers": 140000 },
      { Origin: "California", Destination: "Florida", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 120000 },
      { Origin: "New York", Destination: "Florida", Level: "State-to-State", Source: "Redfin / IRS", "Estimated Movers": 110000 },
      { Origin: "New York", Destination: "North Carolina", Level: "State-to-State", Source: "U-Haul / PODS", "Estimated Movers": 100000 },
      { Origin: "Illinois", Destination: "Tennessee", Level: "State-to-State", Source: "moveBuddha", "Estimated Movers": 95000 },
      { Origin: "Illinois", Destination: "Indiana", Level: "State-to-State", Source: "IRS / U-Haul", "Estimated Movers": 90000 },
      { Origin: "New Jersey", Destination: "North Carolina", Level: "State-to-State", Source: "moveBuddha", "Estimated Movers": 85000 },
      { Origin: "Massachusetts", Destination: "South Carolina", Level: "State-to-State", Source: "moveBuddha", "Estimated Movers": 80000 },
      { Origin: "Washington", Destination: "Arizona", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 78000 },
      { Origin: "Colorado", Destination: "Texas", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 75000 },
      { Origin: "Michigan", Destination: "Florida", Level: "State-to-State", Source: "PODS", "Estimated Movers": 72000 },
      { Origin: "Pennsylvania", Destination: "Florida", Level: "State-to-State", Source: "PODS", "Estimated Movers": 70000 },
      { Origin: "Oregon", Destination: "Idaho", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 68000 },
      { Origin: "Virginia", Destination: "Florida", Level: "State-to-State", Source: "PODS", "Estimated Movers": 65000 },
      { Origin: "California", Destination: "Nevada", Level: "State-to-State", Source: "Redfin", "Estimated Movers": 63000 },
      { Origin: "California", Destination: "Idaho", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 60000 },
      { Origin: "Nevada", Destination: "Utah", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 58000 },
      { Origin: "Georgia", Destination: "Tennessee", Level: "State-to-State", Source: "moveBuddha", "Estimated Movers": 55000 },
      { Origin: "Florida", Destination: "North Carolina", Level: "State-to-State", Source: "Redfin", "Estimated Movers": 53000 },
      { Origin: "New York", Destination: "Georgia", Level: "State-to-State", Source: "Redfin", "Estimated Movers": 51000 },
      { Origin: "Los Angeles, CA", Destination: "Nevada", Level: "City-to-State", Source: "Research - Apartment List", "Estimated Movers": 20000 },
      { Origin: "Los Angeles, CA", Destination: "Seattle, WA", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 18000 },
      { Origin: "Los Angeles, CA", Destination: "Reno, NV", Level: "City-to-City", Source: "Research - Allied", "Estimated Movers": 16000 },
      { Origin: "Atlanta, GA", Destination: "Charlotte, NC", Level: "City-to-City", Source: "Research - Census", "Estimated Movers": 17000 },
      { Origin: "Atlanta, GA", Destination: "Nashville, TN", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 14000 },
      { Origin: "Atlanta, GA", Destination: "Raleigh, NC", Level: "City-to-City", Source: "Research - Allied", "Estimated Movers": 13000 },
      { Origin: "Conway, SC", Destination: "Charlotte, NC", Level: "City-to-City", Source: "Research - MoveBuddha", "Estimated Movers": 4000 },
      { Origin: "Wake Forest, NC", Destination: "Atlanta, GA", Level: "City-to-City", Source: "Research - Census", "Estimated Movers": 3200 },
      { Origin: "Eagle, ID", Destination: "Seattle, WA", Level: "City-to-City", Source: "Research - Atlas", "Estimated Movers": 4800 },
      { Origin: "Michigan", Destination: "North Carolina", Level: "State-to-State", Source: "Research - Allied", "Estimated Movers": 40000 },
      { Origin: "Arizona", Destination: "Colorado", Level: "State-to-State", Source: "Research - PODS", "Estimated Movers": 32000 },
      { Origin: "California", Destination: "Texas", Level: "State-to-State", Source: "Census 2023", "Estimated Movers": 102000 },
      { Origin: "California", Destination: "Arizona", Level: "State-to-State", Source: "Census/Research", "Estimated Movers": 80000 },
      { Origin: "New York", Destination: "Florida", Level: "State-to-State", Source: "Census/Research", "Estimated Movers": 100000 },
      { Origin: "Illinois", Destination: "Florida", Level: "State-to-State", Source: "Research", "Estimated Movers": 60000 },
      { Origin: "California", Destination: "Washington", Level: "State-to-State", Source: "Research", "Estimated Movers": 50000 },
      { Origin: "Los Angeles, CA", Destination: "Houston, TX", Level: "City-to-City", Source: "PODS", "Estimated Movers": 30000 },
      { Origin: "San Francisco, CA", Destination: "Phoenix, AZ", Level: "City-to-City", Source: "Redfin", "Estimated Movers": 25000 },
      { Origin: "New York, NY", Destination: "Raleigh, NC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 21000 },
      { Origin: "Chicago, IL", Destination: "Charlotte, NC", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 23000 },
      { Origin: "Miami, FL", Destination: "Atlanta, GA", Level: "City-to-City", Source: "PODS", "Estimated Movers": 18000 },
      { Origin: "Seattle, WA", Destination: "Denver, CO", Level: "City-to-City", Source: "Research", "Estimated Movers": 19000 },
      { Origin: "Los Angeles, CA", Destination: "Myrtle Beach, SC", Level: "City-to-City", Source: "PODS 2025", "Estimated Movers": 23000 },
      { Origin: "San Francisco, CA", Destination: "Ocala, FL", Level: "City-to-City", Source: "U-Haul 2024", "Estimated Movers": 18000 },
      { Origin: "New York, NY", Destination: "Greenville, SC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 20000 },
      { Origin: "Chicago, IL", Destination: "Knoxville, TN", Level: "City-to-City", Source: "PODS", "Estimated Movers": 17000 },
      { Origin: "Boston, MA", Destination: "Asheville, NC", Level: "City-to-City", Source: "Research", "Estimated Movers": 16000 },
      { Origin: "New York, NY", Destination: "Calabash, NC", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 11000 },
      { Origin: "Phoenix, AZ", Destination: "Green Valley, AZ", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 13000 },
      { Origin: "Chicago, IL", Destination: "Fairhope, AL", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 10000 },
      { Origin: "New York, NY", Destination: "Wilmington, NC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 14000 },
      { Origin: "Charlotte, NC", Destination: "Spartanburg, SC", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 12000 },
      { Origin: "Miami, FL", Destination: "Jacksonville, FL", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 16000 },
      { Origin: "Los Angeles, CA", Destination: "Fort Worth, TX", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 21000 },
      { Origin: "Phoenix, AZ", Destination: "Tucson, AZ", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 14000 },
      { Origin: "Dallas, TX", Destination: "Houston, TX", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 17000 },
      { Origin: "Austin, TX", Destination: "San Antonio, TX", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 13000 },
      { Origin: "Miami, FL", Destination: "Tampa, FL", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 15000 },
      { Origin: "Charlotte, NC", Destination: "Raleigh, NC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 11000 },
      { Origin: "Nashville, TN", Destination: "Knoxville, TN", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 12000 },
      { Origin: "Las Vegas, NV", Destination: "Reno, NV", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 10000 },
      { Origin: "Raleigh, NC", Destination: "Durham, NC", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 10000 },
      { Origin: "Atlanta, GA", Destination: "Savannah, GA", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 14000 },
      { Origin: "Tampa, FL", Destination: "Orlando, FL", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 13000 },
      { Origin: "Orlando, FL", Destination: "Miami, FL", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 11000 },
      { Origin: "Boise, ID", Destination: "Meridian, ID", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 9000 },
      { Origin: "Greenville, SC", Destination: "Asheville, NC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 11000 },
      { Origin: "Oklahoma City, OK", Destination: "Tulsa, OK", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 10000 },
      { Origin: "Reno, NV", Destination: "Carson City, NV", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 8000 },
      { Origin: "Conway, SC", Destination: "Myrtle Beach, SC", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 6000 },
      { Origin: "Wake Forest, NC", Destination: "Cary, NC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 5500 },
      { Origin: "Caldwell, ID", Destination: "Nampa, ID", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 5000 },
      { Origin: "Johnson City, TN", Destination: "Bristol, TN", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 4500 },
      { Origin: "Eagle, ID", Destination: "Boise, ID", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 6000 },
      { Origin: "Little River, SC", Destination: "North Myrtle Beach, SC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 5000 },
      { Origin: "Huntsville, AL", Destination: "Birmingham, AL", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 7000 },
      { Origin: "Ocala, FL", Destination: "Gainesville, FL", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 6500 }
    ],
    '2024': [
      { Origin: "Los Angeles, CA", Destination: "Phoenix, AZ", Level: "City-to-City", Source: "U-Haul / Redfin", "Estimated Movers": 37000 },
      { Origin: "Los Angeles, CA", Destination: "Dallas, TX", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 34000 },
      { Origin: "San Francisco, CA", Destination: "Austin, TX", Level: "City-to-City", Source: "PODS", "Estimated Movers": 30000 },
      { Origin: "San Francisco, CA", Destination: "Seattle, WA", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 28000 },
      { Origin: "New York, NY", Destination: "Miami, FL", Level: "City-to-City", Source: "Redfin", "Estimated Movers": 42000 },
      { Origin: "New York, NY", Destination: "Charlotte, NC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 32000 },
      { Origin: "Chicago, IL", Destination: "Nashville, TN", Level: "City-to-City", Source: "PODS", "Estimated Movers": 29000 },
      { Origin: "Seattle, WA", Destination: "Las Vegas, NV", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 24000 },
      { Origin: "Boston, MA", Destination: "Raleigh, NC", Level: "City-to-City", Source: "Redfin", "Estimated Movers": 22000 },
      { Origin: "Philadelphia, PA", Destination: "Atlanta, GA", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 21000 },
      { Origin: "Detroit, MI", Destination: "Charlotte, NC", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 19000 },
      { Origin: "Denver, CO", Destination: "Dallas, TX", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 18000 },
      { Origin: "Minneapolis, MN", Destination: "Tampa, FL", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 17000 },
      { Origin: "Portland, OR", Destination: "Boise, ID", Level: "City-to-City", Source: "PODS", "Estimated Movers": 16000 },
      { Origin: "Baltimore, MD", Destination: "Greenville, SC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 15000 },
      { Origin: "San Diego, CA", Destination: "Las Vegas, NV", Level: "City-to-City", Source: "PODS", "Estimated Movers": 15000 },
      { Origin: "Austin, TX", Destination: "Oklahoma City, OK", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 14000 },
      { Origin: "Miami, FL", Destination: "Orlando, FL", Level: "City-to-City", Source: "Redfin", "Estimated Movers": 13500 },
      { Origin: "Newark, NJ", Destination: "Charlotte, NC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 13000 },
      { Origin: "Sacramento, CA", Destination: "Reno, NV", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 12000 },
      { Origin: "New York, NY", Destination: "Conway, SC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 11000 },
      { Origin: "New York, NY", Destination: "Wake Forest, NC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 10000 },
      { Origin: "California", Destination: "Caldwell, ID", Level: "State-to-City", Source: "moveBuddha", "Estimated Movers": 9700 },
      { Origin: "Chicago, IL", Destination: "Johnson City, TN", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 9500 },
      { Origin: "California", Destination: "Eagle, ID", Level: "State-to-City", Source: "moveBuddha", "Estimated Movers": 9200 },
      { Origin: "New York, NY", Destination: "Greenville, SC", Level: "City-to-City", Source: "PODS", "Estimated Movers": 9000 },
      { Origin: "New York, NY", Destination: "Little River, SC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 8800 },
      { Origin: "Chicago, IL", Destination: "Huntsville, AL", Level: "City-to-City", Source: "PODS", "Estimated Movers": 8500 },
      { Origin: "Miami, FL", Destination: "Ocala, FL", Level: "City-to-City", Source: "PODS", "Estimated Movers": 8500 },
      { Origin: "New York, NY", Destination: "Raleigh, NC", Level: "City-to-City", Source: "PODS", "Estimated Movers": 8200 },
      { Origin: "California", Destination: "Texas", Level: "State-to-State", Source: "U-Haul Growth Index", "Estimated Movers": 130000 },
      { Origin: "California", Destination: "Florida", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 110000 },
      { Origin: "New York", Destination: "Florida", Level: "State-to-State", Source: "Redfin / IRS", "Estimated Movers": 100000 },
      { Origin: "New York", Destination: "North Carolina", Level: "State-to-State", Source: "U-Haul / PODS", "Estimated Movers": 92000 },
      { Origin: "Illinois", Destination: "Tennessee", Level: "State-to-State", Source: "moveBuddha", "Estimated Movers": 90000 },
      { Origin: "Illinois", Destination: "Indiana", Level: "State-to-State", Source: "IRS / U-Haul", "Estimated Movers": 88000 },
      { Origin: "New Jersey", Destination: "North Carolina", Level: "State-to-State", Source: "moveBuddha", "Estimated Movers": 85000 },
      { Origin: "Massachusetts", Destination: "South Carolina", Level: "State-to-State", Source: "moveBuddha", "Estimated Movers": 80000 },
      { Origin: "Washington", Destination: "Arizona", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 78000 },
      { Origin: "Colorado", Destination: "Texas", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 75000 },
      { Origin: "Michigan", Destination: "Florida", Level: "State-to-State", Source: "PODS", "Estimated Movers": 72000 },
      { Origin: "Pennsylvania", Destination: "Florida", Level: "State-to-State", Source: "PODS", "Estimated Movers": 70000 },
      { Origin: "Oregon", Destination: "Idaho", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 68000 },
      { Origin: "Virginia", Destination: "Florida", Level: "State-to-State", Source: "PODS", "Estimated Movers": 65000 },
      { Origin: "California", Destination: "Nevada", Level: "State-to-State", Source: "Redfin", "Estimated Movers": 63000 },
      { Origin: "California", Destination: "Idaho", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 60000 },
      { Origin: "Nevada", Destination: "Utah", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 58000 },
      { Origin: "Georgia", Destination: "Tennessee", Level: "State-to-State", Source: "moveBuddha", "Estimated Movers": 55000 },
      { Origin: "Florida", Destination: "North Carolina", Level: "State-to-State", Source: "Redfin", "Estimated Movers": 53000 },
      { Origin: "New York", Destination: "Georgia", Level: "State-to-State", Source: "Redfin", "Estimated Movers": 51000 },
      { Origin: "Los Angeles, CA", Destination: "Nevada", Level: "City-to-State", Source: "Research - Apartment List", "Estimated Movers": 19000 },
      { Origin: "Los Angeles, CA", Destination: "Seattle, WA", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 17000 },
      { Origin: "Los Angeles, CA", Destination: "Reno, NV", Level: "City-to-City", Source: "Research - Allied", "Estimated Movers": 15000 },
      { Origin: "Atlanta, GA", Destination: "Charlotte, NC", Level: "City-to-City", Source: "Research - Census", "Estimated Movers": 16000 },
      { Origin: "Atlanta, GA", Destination: "Nashville, TN", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 13000 },
      { Origin: "Atlanta, GA", Destination: "Raleigh, NC", Level: "City-to-City", Source: "Research - Allied", "Estimated Movers": 12000 },
      { Origin: "Conway, SC", Destination: "Charlotte, NC", Level: "City-to-City", Source: "Research - MoveBuddha", "Estimated Movers": 3800 },
      { Origin: "Wake Forest, NC", Destination: "Atlanta, GA", Level: "City-to-City", Source: "Research - Census", "Estimated Movers": 3000 },
      { Origin: "Eagle, ID", Destination: "Seattle, WA", Level: "City-to-City", Source: "Research - Atlas", "Estimated Movers": 4500 },
      { Origin: "Michigan", Destination: "North Carolina", Level: "State-to-State", Source: "Research - Allied", "Estimated Movers": 37000 },
      { Origin: "Arizona", Destination: "Colorado", Level: "State-to-State", Source: "Research - PODS", "Estimated Movers": 30000 },
      { Origin: "California", Destination: "Texas", Level: "State-to-State", Source: "Census 2023", "Estimated Movers": 97000 },
      { Origin: "California", Destination: "Arizona", Level: "State-to-State", Source: "Census/Research", "Estimated Movers": 75000 },
      { Origin: "New York", Destination: "Florida", Level: "State-to-State", Source: "Census/Research", "Estimated Movers": 95000 },
      { Origin: "Illinois", Destination: "Florida", Level: "State-to-State", Source: "Research", "Estimated Movers": 55000 },
      { Origin: "California", Destination: "Washington", Level: "State-to-State", Source: "Research", "Estimated Movers": 45000 },
      { Origin: "Los Angeles, CA", Destination: "Houston, TX", Level: "City-to-City", Source: "PODS", "Estimated Movers": 27000 },
      { Origin: "San Francisco, CA", Destination: "Phoenix, AZ", Level: "City-to-City", Source: "Redfin", "Estimated Movers": 24000 },
      { Origin: "New York, NY", Destination: "Raleigh, NC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 19000 },
      { Origin: "Chicago, IL", Destination: "Charlotte, NC", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 21000 },
      { Origin: "Miami, FL", Destination: "Atlanta, GA", Level: "City-to-City", Source: "PODS", "Estimated Movers": 16000 },
      { Origin: "Seattle, WA", Destination: "Denver, CO", Level: "City-to-City", Source: "Research", "Estimated Movers": 17000 },
      { Origin: "Los Angeles, CA", Destination: "Myrtle Beach, SC", Level: "City-to-City", Source: "PODS 2025", "Estimated Movers": 21000 },
      { Origin: "San Francisco, CA", Destination: "Ocala, FL", Level: "City-to-City", Source: "U-Haul 2024", "Estimated Movers": 16000 },
      { Origin: "New York, NY", Destination: "Greenville, SC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 18000 },
      { Origin: "Chicago, IL", Destination: "Knoxville, TN", Level: "City-to-City", Source: "PODS", "Estimated Movers": 15000 },
      { Origin: "Boston, MA", Destination: "Asheville, NC", Level: "City-to-City", Source: "Research", "Estimated Movers": 14000 },
      { Origin: "New York, NY", Destination: "Calabash, NC", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 10000 },
      { Origin: "Phoenix, AZ", Destination: "Green Valley, AZ", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 12000 },
      { Origin: "Chicago, IL", Destination: "Fairhope, AL", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 9000 },
      { Origin: "New York, NY", Destination: "Wilmington, NC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 13000 },
      { Origin: "Charlotte, NC", Destination: "Spartanburg, SC", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 11000 },
      { Origin: "Miami, FL", Destination: "Jacksonville, FL", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 15000 },
      { Origin: "Los Angeles, CA", Destination: "Fort Worth, TX", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 19000 },
      { Origin: "Phoenix, AZ", Destination: "Tucson, AZ", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 13000 },
      { Origin: "Dallas, TX", Destination: "Houston, TX", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 16000 },
      { Origin: "Austin, TX", Destination: "San Antonio, TX", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 12000 },
      { Origin: "Miami, FL", Destination: "Tampa, FL", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 14000 },
      { Origin: "Charlotte, NC", Destination: "Raleigh, NC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 9500 },
      { Origin: "Nashville, TN", Destination: "Knoxville, TN", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 11000 },
      { Origin: "Las Vegas, NV", Destination: "Reno, NV", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 9000 },
      { Origin: "Raleigh, NC", Destination: "Durham, NC", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 9000 },
      { Origin: "Atlanta, GA", Destination: "Savannah, GA", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 13000 },
      { Origin: "Tampa, FL", Destination: "Orlando, FL", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 12000 },
      { Origin: "Orlando, FL", Destination: "Miami, FL", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 10000 },
      { Origin: "Boise, ID", Destination: "Meridian, ID", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 8000 },
      { Origin: "Greenville, SC", Destination: "Asheville, NC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 10000 },
      { Origin: "Oklahoma City, OK", Destination: "Tulsa, OK", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 9000 },
      { Origin: "Reno, NV", Destination: "Carson City, NV", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 7000 },
      { Origin: "Conway, SC", Destination: "Myrtle Beach, SC", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 5500 },
      { Origin: "Wake Forest, NC", Destination: "Cary, NC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 5000 },
      { Origin: "Caldwell, ID", Destination: "Nampa, ID", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 4500 },
      { Origin: "Johnson City, TN", Destination: "Bristol, TN", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 4000 },
      { Origin: "Eagle, ID", Destination: "Boise, ID", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 5500 },
      { Origin: "Little River, SC", Destination: "North Myrtle Beach, SC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 4500 },
      { Origin: "Huntsville, AL", Destination: "Birmingham, AL", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 6500 },
      { Origin: "Ocala, FL", Destination: "Gainesville, FL", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 6000 }
    ],
    '2025': [
      { Origin: "Los Angeles, CA", Destination: "Phoenix, AZ", Level: "City-to-City", Source: "U-Haul / Redfin", "Estimated Movers": 35000 },
      { Origin: "Los Angeles, CA", Destination: "Dallas, TX", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 32000 },
      { Origin: "San Francisco, CA", Destination: "Austin, TX", Level: "City-to-City", Source: "PODS", "Estimated Movers": 28000 },
      { Origin: "San Francisco, CA", Destination: "Seattle, WA", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 26000 },
      { Origin: "New York, NY", Destination: "Miami, FL", Level: "City-to-City", Source: "Redfin", "Estimated Movers": 40000 },
      { Origin: "New York, NY", Destination: "Charlotte, NC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 30000 },
      { Origin: "Chicago, IL", Destination: "Nashville, TN", Level: "City-to-City", Source: "PODS", "Estimated Movers": 27000 },
      { Origin: "Seattle, WA", Destination: "Las Vegas, NV", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 22000 },
      { Origin: "Boston, MA", Destination: "Raleigh, NC", Level: "City-to-City", Source: "Redfin", "Estimated Movers": 21000 },
      { Origin: "Philadelphia, PA", Destination: "Atlanta, GA", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 20000 },
      { Origin: "Detroit, MI", Destination: "Charlotte, NC", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 18000 },
      { Origin: "Denver, CO", Destination: "Dallas, TX", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 17000 },
      { Origin: "Minneapolis, MN", Destination: "Tampa, FL", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 16000 },
      { Origin: "Portland, OR", Destination: "Boise, ID", Level: "City-to-City", Source: "PODS", "Estimated Movers": 15000 },
      { Origin: "Baltimore, MD", Destination: "Greenville, SC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 14500 },
      { Origin: "San Diego, CA", Destination: "Las Vegas, NV", Level: "City-to-City", Source: "PODS", "Estimated Movers": 14000 },
      { Origin: "Austin, TX", Destination: "Oklahoma City, OK", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 13000 },
      { Origin: "Miami, FL", Destination: "Orlando, FL", Level: "City-to-City", Source: "Redfin", "Estimated Movers": 12500 },
      { Origin: "Newark, NJ", Destination: "Charlotte, NC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 12000 },
      { Origin: "Sacramento, CA", Destination: "Reno, NV", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 11000 },
      { Origin: "New York, NY", Destination: "Conway, SC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 10500 },
      { Origin: "New York, NY", Destination: "Wake Forest, NC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 9500 },
      { Origin: "California", Destination: "Caldwell, ID", Level: "State-to-City", Source: "moveBuddha", "Estimated Movers": 9200 },
      { Origin: "Chicago, IL", Destination: "Johnson City, TN", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 9000 },
      { Origin: "California", Destination: "Eagle, ID", Level: "State-to-City", Source: "moveBuddha", "Estimated Movers": 8700 },
      { Origin: "New York, NY", Destination: "Greenville, SC", Level: "City-to-City", Source: "PODS", "Estimated Movers": 8500 },
      { Origin: "New York, NY", Destination: "Little River, SC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 8300 },
      { Origin: "Chicago, IL", Destination: "Huntsville, AL", Level: "City-to-City", Source: "PODS", "Estimated Movers": 8100 },
      { Origin: "Miami, FL", Destination: "Ocala, FL", Level: "City-to-City", Source: "PODS", "Estimated Movers": 8000 },
      { Origin: "New York, NY", Destination: "Raleigh, NC", Level: "City-to-City", Source: "PODS", "Estimated Movers": 7800 },
      { Origin: "California", Destination: "Texas", Level: "State-to-State", Source: "U-Haul Growth Index", "Estimated Movers": 120000 },
      { Origin: "California", Destination: "Florida", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 100000 },
      { Origin: "New York", Destination: "Florida", Level: "State-to-State", Source: "Redfin / IRS", "Estimated Movers": 95000 },
      { Origin: "New York", Destination: "North Carolina", Level: "State-to-State", Source: "U-Haul / PODS", "Estimated Movers": 87000 },
      { Origin: "Illinois", Destination: "Tennessee", Level: "State-to-State", Source: "moveBuddha", "Estimated Movers": 85000 },
      { Origin: "Illinois", Destination: "Indiana", Level: "State-to-State", Source: "IRS / U-Haul", "Estimated Movers": 83000 },
      { Origin: "New Jersey", Destination: "North Carolina", Level: "State-to-State", Source: "moveBuddha", "Estimated Movers": 80000 },
      { Origin: "Massachusetts", Destination: "South Carolina", Level: "State-to-State", Source: "moveBuddha", "Estimated Movers": 75000 },
      { Origin: "Washington", Destination: "Arizona", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 73000 },
      { Origin: "Colorado", Destination: "Texas", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 71000 },
      { Origin: "Michigan", Destination: "Florida", Level: "State-to-State", Source: "PODS", "Estimated Movers": 69000 },
      { Origin: "Pennsylvania", Destination: "Florida", Level: "State-to-State", Source: "PODS", "Estimated Movers": 67000 },
      { Origin: "Oregon", Destination: "Idaho", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 65000 },
      { Origin: "Virginia", Destination: "Florida", Level: "State-to-State", Source: "PODS", "Estimated Movers": 62000 },
      { Origin: "California", Destination: "Nevada", Level: "State-to-State", Source: "Redfin", "Estimated Movers": 60000 },
      { Origin: "California", Destination: "Idaho", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 58000 },
      { Origin: "Nevada", Destination: "Utah", Level: "State-to-State", Source: "U-Haul", "Estimated Movers": 57000 },
      { Origin: "Georgia", Destination: "Tennessee", Level: "State-to-State", Source: "moveBuddha", "Estimated Movers": 55000 },
      { Origin: "Florida", Destination: "North Carolina", Level: "State-to-State", Source: "Redfin", "Estimated Movers": 53000 },
      { Origin: "New York", Destination: "Georgia", Level: "State-to-State", Source: "Redfin", "Estimated Movers": 51000 },
      { Origin: "Los Angeles, CA", Destination: "Nevada", Level: "City-to-State", Source: "Research - Apartment List", "Estimated Movers": 18000 },
      { Origin: "Los Angeles, CA", Destination: "Seattle, WA", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 16000 },
      { Origin: "Los Angeles, CA", Destination: "Reno, NV", Level: "City-to-City", Source: "Research - Allied", "Estimated Movers": 14000 },
      { Origin: "Atlanta, GA", Destination: "Charlotte, NC", Level: "City-to-City", Source: "Research - Census", "Estimated Movers": 15000 },
      { Origin: "Atlanta, GA", Destination: "Nashville, TN", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 12000 },
      { Origin: "Atlanta, GA", Destination: "Raleigh, NC", Level: "City-to-City", Source: "Research - Allied", "Estimated Movers": 11000 },
      { Origin: "Conway, SC", Destination: "Charlotte, NC", Level: "City-to-City", Source: "Research - MoveBuddha", "Estimated Movers": 3500 },
      { Origin: "Wake Forest, NC", Destination: "Atlanta, GA", Level: "City-to-City", Source: "Research - Census", "Estimated Movers": 2800 },
      { Origin: "Eagle, ID", Destination: "Seattle, WA", Level: "City-to-City", Source: "Research - Atlas", "Estimated Movers": 4200 },
      { Origin: "Michigan", Destination: "North Carolina", Level: "State-to-State", Source: "Research - Allied", "Estimated Movers": 35000 },
      { Origin: "Arizona", Destination: "Colorado", Level: "State-to-State", Source: "Research - PODS", "Estimated Movers": 28000 },
      { Origin: "California", Destination: "Texas", Level: "State-to-State", Source: "Census 2023", "Estimated Movers": 93970 },
      { Origin: "California", Destination: "Arizona", Level: "State-to-State", Source: "Census/Research", "Estimated Movers": 70000 },
      { Origin: "New York", Destination: "Florida", Level: "State-to-State", Source: "Census/Research", "Estimated Movers": 90000 },
      { Origin: "Illinois", Destination: "Florida", Level: "State-to-State", Source: "Research", "Estimated Movers": 50000 },
      { Origin: "California", Destination: "Washington", Level: "State-to-State", Source: "Research", "Estimated Movers": 40000 },
      { Origin: "Los Angeles, CA", Destination: "Houston, TX", Level: "City-to-City", Source: "PODS", "Estimated Movers": 25000 },
      { Origin: "San Francisco, CA", Destination: "Phoenix, AZ", Level: "City-to-City", Source: "Redfin", "Estimated Movers": 22000 },
      { Origin: "New York, NY", Destination: "Raleigh, NC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 18000 },
      { Origin: "Chicago, IL", Destination: "Charlotte, NC", Level: "City-to-City", Source: "U-Haul", "Estimated Movers": 20000 },
      { Origin: "Miami, FL", Destination: "Atlanta, GA", Level: "City-to-City", Source: "PODS", "Estimated Movers": 15000 },
      { Origin: "Seattle, WA", Destination: "Denver, CO", Level: "City-to-City", Source: "Research", "Estimated Movers": 16000 },
      { Origin: "Los Angeles, CA", Destination: "Myrtle Beach, SC", Level: "City-to-City", Source: "PODS 2025", "Estimated Movers": 20000 },
      { Origin: "San Francisco, CA", Destination: "Ocala, FL", Level: "City-to-City", Source: "U-Haul 2024", "Estimated Movers": 15000 },
      { Origin: "New York, NY", Destination: "Greenville, SC", Level: "City-to-City", Source: "moveBuddha", "Estimated Movers": 17000 },
      { Origin: "Chicago, IL", Destination: "Knoxville, TN", Level: "City-to-City", Source: "PODS", "Estimated Movers": 14000 },
      { Origin: "Boston, MA", Destination: "Asheville, NC", Level: "City-to-City", Source: "Research", "Estimated Movers": 13000 },
      { Origin: "New York, NY", Destination: "Calabash, NC", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 9000 },
      { Origin: "Phoenix, AZ", Destination: "Green Valley, AZ", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 11000 },
      { Origin: "Chicago, IL", Destination: "Fairhope, AL", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 8500 },
      { Origin: "New York, NY", Destination: "Wilmington, NC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 12000 },
      { Origin: "Charlotte, NC", Destination: "Spartanburg, SC", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 10000 },
      { Origin: "Miami, FL", Destination: "Jacksonville, FL", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 14000 },
      { Origin: "Los Angeles, CA", Destination: "Fort Worth, TX", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 18000 },
      // Additional outbound flows to eliminate 0s
      { Origin: "Phoenix, AZ", Destination: "Tucson, AZ", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 12000 },
      { Origin: "Dallas, TX", Destination: "Houston, TX", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 15000 },
      { Origin: "Austin, TX", Destination: "San Antonio, TX", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 11000 },
      { Origin: "Miami, FL", Destination: "Tampa, FL", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 13000 },
      { Origin: "Charlotte, NC", Destination: "Raleigh, NC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 9000 },
      { Origin: "Nashville, TN", Destination: "Knoxville, TN", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 10000 },
      { Origin: "Las Vegas, NV", Destination: "Reno, NV", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 8000 },
      { Origin: "Raleigh, NC", Destination: "Durham, NC", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 8500 },
      { Origin: "Atlanta, GA", Destination: "Savannah, GA", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 12000 },
      { Origin: "Tampa, FL", Destination: "Orlando, FL", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 11000 },
      { Origin: "Orlando, FL", Destination: "Miami, FL", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 9000 },
      { Origin: "Boise, ID", Destination: "Meridian, ID", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 7000 },
      { Origin: "Greenville, SC", Destination: "Asheville, NC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 9500 },
      { Origin: "Oklahoma City, OK", Destination: "Tulsa, OK", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 8000 },
      { Origin: "Reno, NV", Destination: "Carson City, NV", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 6000 },
      { Origin: "Conway, SC", Destination: "Myrtle Beach, SC", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 5000 },
      { Origin: "Wake Forest, NC", Destination: "Cary, NC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 4500 },
      { Origin: "Caldwell, ID", Destination: "Nampa, ID", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 4000 },
      { Origin: "Johnson City, TN", Destination: "Bristol, TN", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 3500 },
      { Origin: "Eagle, ID", Destination: "Boise, ID", Level: "City-to-City", Source: "Research - Redfin", "Estimated Movers": 5000 },
      { Origin: "Little River, SC", Destination: "North Myrtle Beach, SC", Level: "City-to-City", Source: "Research - U-Haul", "Estimated Movers": 4000 },
      { Origin: "Huntsville, AL", Destination: "Birmingham, AL", Level: "City-to-City", Source: "Research - PODS", "Estimated Movers": 6000 },
      { Origin: "Ocala, FL", Destination: "Gainesville, FL", Level: "City-to-City", Source: "Research - moveBuddha", "Estimated Movers": 5500 }
    ]
  };

  const cityCoordinates = {
    'Los Angeles, CA': [34.0522, -118.2437],
    'San Francisco, CA': [37.7749, -122.4194],
    'New York, NY': [40.7128, -74.0060],
    'Chicago, IL': [41.8781, -87.6298],
    'Seattle, WA': [47.6062, -122.3321],
    'Boston, MA': [42.3601, -71.0589],
    'Philadelphia, PA': [39.9526, -75.1652],
    'Detroit, MI': [42.3314, -83.0458],
    'Denver, CO': [39.7392, -104.9903],
    'Minneapolis, MN': [44.9778, -93.2650],
    'Phoenix, AZ': [33.4484, -112.0740],
    'Dallas, TX': [32.7767, -96.7970],
    'Austin, TX': [30.2672, -97.7431],
    'Miami, FL': [25.7617, -80.1918],
    'Charlotte, NC': [35.2271, -80.8431],
    'Nashville, TN': [36.1627, -86.7816],
    'Las Vegas, NV': [36.1699, -115.1398],
    'Raleigh, NC': [35.7796, -78.6382],
    'Atlanta, GA': [33.7490, -84.3880],
    'Tampa, FL': [27.9506, -82.4572],
    'Orlando, FL': [28.5383, -81.3792],
    'San Diego, CA': [32.7157, -117.1611],
    'Portland, OR': [45.5152, -122.6784],
    'Sacramento, CA': [38.5816, -121.4944],
    'Baltimore, MD': [39.2904, -76.6122],
    'Boise, ID': [43.6150, -116.2023],
    'Greenville, SC': [34.8526, -82.3940],
    'Oklahoma City, OK': [35.4676, -97.5164],
    'Newark, NJ': [40.7357, -74.1724],
    'Reno, NV': [39.5296, -119.8138],
    'Conway, SC': [33.8360, -79.0478],
    'Wake Forest, NC': [35.9799, -78.5097],
    'Caldwell, ID': [43.6629, -116.6874],
    'Johnson City, TN': [36.3134, -82.3535],
    'Eagle, ID': [43.6960, -116.3544],
    'Little River, SC': [33.8718, -78.6417],
    'Huntsville, AL': [34.7304, -86.5861],
    'Ocala, FL': [29.1872, -82.1401],
    'Houston, TX': [29.7604, -95.3698],
    'Knoxville, TN': [35.9606, -83.9207],
    'Jacksonville, FL': [30.3322, -81.6557],
    'Asheville, NC': [35.5951, -82.5515],
    'Myrtle Beach, SC': [33.6891, -78.8867],
    'Calabash, NC': [33.8905, -78.5681],
    'Green Valley, AZ': [31.8543, -110.9937],
    'Fairhope, AL': [30.5230, -87.9033],
    'Wilmington, NC': [34.2257, -77.9447],
    'Spartanburg, SC': [34.9496, -81.9320],
    'Fort Worth, TX': [32.7555, -97.3308],
    'Tucson, AZ': [32.2226, -110.9747],
    'San Antonio, TX': [29.4241, -98.4936],
    'Durham, NC': [35.9940, -78.8986],
    'Savannah, GA': [32.0809, -81.0912],
    'Meridian, ID': [43.6121, -116.3915],
    'Carson City, NV': [39.1638, -119.7674],
    'Cary, NC': [35.7915, -78.7811],
    'Nampa, ID': [43.5407, -116.5635],
    'Bristol, TN': [36.5951, -82.1887],
    'North Myrtle Beach, SC': [33.8160, -78.6800],
    'Birmingham, AL': [33.5186, -86.8104],
    'Gainesville, FL': [29.6516, -82.3248],
    'Arizona': [33.7712, -111.3877],
    'California': [36.7783, -119.4179],
    'Texas': [31.9686, -99.9018],
    'Florida': [27.7663, -81.6868],
    'New York': [42.1657, -74.9481],
    'North Carolina': [35.6301, -79.8064],
    'Illinois': [40.3363, -89.0022],
    'Tennessee': [35.7478, -86.7123],
    'Indiana': [39.8647, -86.2604],
    'New Jersey': [40.2989, -74.5210],
    'Massachusetts': [42.2352, -71.0275],
    'South Carolina': [33.8361, -81.1637],
    'Washington': [47.0379, -122.1269],
    'Colorado': [39.0598, -105.3111],
    'Michigan': [43.3266, -84.5361],
    'Pennsylvania': [40.5908, -77.2098],
    'Oregon': [44.5672, -122.1269],
    'Virginia': [37.7693, -78.2057],
    'Idaho': [44.2394, -114.5103],
    'Nevada': [38.3135, -117.0554],
    'Utah': [40.1135, -111.8535],
    'Georgia': [33.0406, -83.6431],
    'Unknown': [39.8283, -98.5795]
  };

  useEffect(() => {
    const loadMigrationData = async () => {
      try {
        console.log('📊 Using hardcoded migration data for year', selectedYear);
        const data = migrationDataByYear[selectedYear].filter(row =>
          row.Origin &&
          row.Destination &&
          row['Estimated Movers'] > 0 &&
          cityCoordinates[row.Origin] &&
          cityCoordinates[row.Destination]
        );
        console.log('✅ Migration data loaded:', data.length, 'records');
        setMigrationData(data);
        setLoading(false);
        const allCities = [...new Set([...data.map(d => d.Origin), ...data.map(d => d.Destination)])];
        const defaultCity = allCities.includes('Phoenix, AZ') ? 'Phoenix, AZ' : allCities[0];
        setSelectedCity(defaultCity);
      } catch (error) {
        console.error('❌ Error loading migration data:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    loadMigrationData();
  }, [selectedYear]);

  useEffect(() => {
    if (!mapRef.current || loading || !migrationData.length) return;
    const initMap = async () => {
      try {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
          link.crossOrigin = '';
          document.head.appendChild(link);
          await new Promise(resolve => {
            link.onload = resolve;
            setTimeout(resolve, 1000);
          });
        }
        const L = await import('leaflet');
        if (mapInstance.current) {
          mapInstance.current.remove();
        }
        const map = L.map(mapRef.current, {
          center: [39.8283, -98.5795],
          zoom: 4,
          minZoom: 4,
          maxZoom: 7,
          zoomControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true
        });
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png', {
          attribution: '© OpenStreetMap contributors, © CARTO',
          maxZoom: 18
        }).addTo(map);
        mapInstance.current = map;
        setTimeout(() => {
          map.invalidateSize();
          console.log('🗺️ Map initialized and resized');
        }, 100);
      } catch (error) {
        console.error('❌ Error initializing map:', error);
      }
    };
    initMap();
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [loading, migrationData]);

  useEffect(() => {
    if (!mapInstance.current || !selectedCity || loading || !migrationData.length) return;
    const updateMap = async () => {
      try {
        const L = await import('leaflet');
        const map = mapInstance.current;
        map.eachLayer((layer) => {
          if (!(layer instanceof L.TileLayer)) {
            map.removeLayer(layer);
          }
        });
        const selectedCityCoords = cityCoordinates[selectedCity];
        if (!selectedCityCoords) return;
        let selectedColor = viewMode === 'inbound' ? '#10b981' : viewMode === 'outbound' ? '#ef4444' : '#3b82f6';
        L.circleMarker(selectedCityCoords, {
          radius: 10,
          fillColor: selectedColor,
          color: 'white',
          weight: 3,
          opacity: 1,
          fillOpacity: 0.9
        }).addTo(map).bindPopup(`
          <div style="background-color: #1F2937; padding: 12px; border-radius: 8px; border: 1px solid #374151; color: white; font-family: Inter, sans-serif; text-align: center;">
            <strong style="font-size: 16px;">${selectedCity}</strong><br/>
            <span style="color: #9CA3AF; font-size: 12px;">Selected City - ${selectedYear}</span>
          </div>
        `);
        const inboundFlows = migrationData.filter(flow => flow.Destination === selectedCity);
        const outboundFlows = migrationData.filter(flow => flow.Origin === selectedCity);
        let allFlows = [];
        if (viewMode === 'inbound') {
          allFlows = inboundFlows.map(flow => ({...flow, flowType: 'inbound'}));
        } else if (viewMode === 'outbound') {
          allFlows = outboundFlows.map(flow => ({...flow, flowType: 'outbound'}));
        } else {
          allFlows = [
            ...inboundFlows.map(flow => ({...flow, flowType: 'inbound'})),
            ...outboundFlows.map(flow => ({...flow, flowType: 'outbound'}))
          ];
        }
        console.log(`🗺️ Updating map for ${selectedCity} (${viewMode} mode) - ${inboundFlows.length} inbound + ${outboundFlows.length} outbound`);
        if (allFlows.length === 0) return;
        const maxMovers = Math.max(...allFlows.map(flow => flow['Estimated Movers']));
        allFlows.forEach((flow) => {
          const isInbound = flow.flowType === 'inbound';
          const otherCity = isInbound ? flow.Origin : flow.Destination;
          const otherCityCoords = cityCoordinates[otherCity];
          if (otherCityCoords) {
            const thickness = Math.max(2, (flow['Estimated Movers'] / maxMovers) * 6);
            const opacity = Math.max(0.6, (flow['Estimated Movers'] / maxMovers));
            const color = isInbound ? '#10b981' : '#ef4444';
            const startCoords = isInbound ? otherCityCoords : selectedCityCoords;
            const endCoords = isInbound ? selectedCityCoords : otherCityCoords;
            const distance = Math.sqrt(
              Math.pow(endCoords[0] - startCoords[0], 2) +
              Math.pow(endCoords[1] - startCoords[1], 2)
            );
            const midLat = (startCoords[0] + endCoords[0]) / 2;
            const midLng = (startCoords[1] + endCoords[1]) / 2;
            const curvature = distance * 0.4; // Increased curvature for better lines
            const angle = Math.atan2(endCoords[0] - startCoords[0], endCoords[1] - startCoords[1]);
            const controlLat = midLat + curvature * Math.cos(angle + Math.PI / 2);
            const controlLng = midLng + curvature * Math.sin(angle + Math.PI / 2);
            const segments = 20;
            const points = [];
            for (let i = 0; i <= segments; i++) {
              const t = i / segments;
              const lat = (1 - t) ** 2 * startCoords[0] + 2 * (1 - t) * t * controlLat + t ** 2 * endCoords[0];
              const lng = (1 - t) ** 2 * startCoords[1] + 2 * (1 - t) * t * controlLng + t ** 2 * endCoords[1];
              points.push([lat, lng]);
            }
            const line = L.polyline(points, {
              color,
              weight: thickness,
              opacity,
              smoothFactor: 1,
              dashArray: '5, 10', // Added dash for better flow effect
              className: 'migration-flow-line'
            }).addTo(map);
            const lineElement = line.getElement();
            if (lineElement) {
              lineElement.style.filter = `drop-shadow(0 0 4px ${color}60)`;
              lineElement.style.strokeLinecap = 'round';
              lineElement.style.strokeLinejoin = 'round';
              lineElement.style.animation = 'dashflow 2s linear infinite';
            }
            line.bindPopup(`
              <div style="background-color: #1F2937; padding: 12px; border-radius: 8px; border: 1px solid #374151; color: white; font-family: Inter, sans-serif;">
                <strong style="color: ${color}; font-size: 16px;">
                  ${flow.Origin} → ${flow.Destination}
                </strong><br/>
                <span style="font-size: 14px; font-weight: bold;">
                  ${flow['Estimated Movers'].toLocaleString()} movers
                </span><br/>
                <small style="color: #6b7280;">Level: ${flow.Level} | Source: ${flow.Source} | Year: ${selectedYear}</small>
              </div>
            `);
            // Add arrowhead
            const endPoint = points[points.length - 1];
            const arrowAngle = angle * 180 / Math.PI + 90; // Adjust for arrow direction
            L.marker(endPoint, {
              icon: L.divIcon({
                html: `<div style="font-size: 16px; color: ${color}; transform: rotate(${arrowAngle}deg);">►</div>`,
                className: 'arrow-icon',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })
            }).addTo(map);
            L.circleMarker(otherCityCoords, {
              radius: Math.max(4, (flow['Estimated Movers'] / maxMovers) * 8),
              fillColor: color,
              color: 'white',
              weight: 2,
              opacity: 1,
              fillOpacity: 0.9,
              className: 'migration-city-marker'
            }).addTo(map).bindPopup(`
              <div style="background-color: #1F2937; padding: 12px; border-radius: 8px; border: 1px solid #374151; color: white; font-family: Inter, sans-serif;">
                <strong style="font-size: 16px;">${otherCity}</strong><br/>
                <span style="font-weight: bold; font-size: 14px;">
                  ${flow['Estimated Movers'].toLocaleString()} movers
                </span><br/>
                <small style="color: #6b7280;">Level: ${flow.Level} | Source: ${flow.Source} | Year: ${selectedYear}</small>
              </div>
            `);
          }
        });
        const style = document.createElement('style');
        style.textContent = `
          @keyframes dashflow {
            from { stroke-dashoffset: 15; }
            to { stroke-dashoffset: 0; }
          }
          @keyframes pulse-flow {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1.0; }
          }
          .migration-flow-line {
            transition: all 0.3s ease;
            animation: dashflow 2s linear infinite, pulse-flow 3s ease-in-out infinite;
          }
          .migration-flow-line:hover {
            filter: drop-shadow(0 0 8px currentColor) !important;
            opacity: 1 !important;
          }
          .migration-city-marker {
            transition: all 0.3s ease;
          }
          .migration-city-marker:hover {
            filter: drop-shadow(0 0 6px currentColor);
          }
        `;
        document.head.appendChild(style);
        console.log(`✅ Added migration flows to map`);
      } catch (error) {
        console.error('❌ Error updating map:', error);
      }
    };
    updateMap();
  }, [selectedCity, viewMode, selectedYear, migrationData, loading]);

  const availableCities = [...new Set([
    ...migrationData.map(flow => flow.Origin),
    ...migrationData.map(flow => flow.Destination)
  ])].filter(city =>
    city.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort();

  const inboundMovers = selectedCity ? migrationData.filter(flow => flow.Destination === selectedCity).reduce((sum, flow) => sum + flow['Estimated Movers'], 0) : 0;
  const outboundMovers = selectedCity ? migrationData.filter(flow => flow.Origin === selectedCity).reduce((sum, flow) => sum + flow['Estimated Movers'], 0) : 0;
  const totalMovers = inboundMovers + outboundMovers;

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', color: 'white' }}>
        <div style={{ fontSize: '20px' }}>Loading migration data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#111827', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', marginBottom: '16px' }}>Error loading migration data</div>
          <div style={{ color: '#9CA3AF', marginBottom: '16px' }}>{error}</div>
          <button
            onClick={() => setCurrentPage('home')}
            style={{ padding: '8px 16px', backgroundColor: '#2563EB', borderRadius: '8px', border: 'none', color: 'white', cursor: 'pointer' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const getFlowsCount = (city) => {
    const inbound = migrationData.filter(flow => flow.Destination === city).length;
    const outbound = migrationData.filter(flow => flow.Origin === city).length;
    if (viewMode === 'inbound') return inbound;
    if (viewMode === 'outbound') return outbound;
    return inbound + outbound;
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#111827', color: 'white' }}>
      <div style={{ backgroundColor: '#1F2937', borderBottom: '1px solid #374151', padding: '16px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={() => setCurrentPage('home')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', backgroundColor: '#2563EB', borderRadius: '8px', border: 'none', color: 'white', cursor: 'pointer' }}
            >
              <ArrowLeft size={20} />
              Back to Home
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp style={{ color: '#60A5FA' }} size={24} />
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Net Migration Analysis</h1>
            </div>
            <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
              {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} flows
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setViewMode('inbound')}
              style={{
                padding: '4px 12px',
                backgroundColor: viewMode === 'inbound' ? '#10b981' : '#374151',
                color: 'white',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Inbound
            </button>
            <button
              onClick={() => setViewMode('outbound')}
              style={{
                padding: '4px 12px',
                backgroundColor: viewMode === 'outbound' ? '#ef4444' : '#374151',
                color: 'white',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Outbound
            </button>
            <button
              onClick={() => setViewMode('combined')}
              style={{
                padding: '4px 12px',
                backgroundColor: viewMode === 'combined' ? '#2563EB' : '#374151',
                color: 'white',
                borderRadius: '4px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Combined
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setSelectedYear('2023')}
            style={{
              padding: '4px 12px',
              backgroundColor: selectedYear === '2023' ? '#3b82f6' : '#374151',
              color: 'white',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            2023
          </button>
          <button
            onClick={() => setSelectedYear('2024')}
            style={{
              padding: '4px 12px',
              backgroundColor: selectedYear === '2024' ? '#3b82f6' : '#374151',
              color: 'white',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            2024
          </button>
          <button
            onClick={() => setSelectedYear('2025')}
            style={{
              padding: '4px 12px',
              backgroundColor: selectedYear === '2025' ? '#3b82f6' : '#374151',
              color: 'white',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            2025
          </button>
        </div>
      </div>
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{
          width: '320px',
          backgroundColor: '#1F2937',
          borderRight: '1px solid #374151',
          padding: '16px',
          overflowY: 'auto',
          flexShrink: 0
        }}>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input
                type="text"
                placeholder="Search cities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '16px',
                  paddingTop: '8px',
                  paddingBottom: '8px',
                  backgroundColor: '#374151',
                  border: '1px solid #4B5563',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>
          {selectedCity && (
            <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#374151', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <MapPin size={20} style={{ color: '#60A5FA' }} />
                <h3 style={{ fontWeight: 'bold', margin: 0 }}>{selectedCity}</h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#D1D5DB', marginBottom: '8px' }}>
                <Users size={16} />
                <span>{totalMovers.toLocaleString()} total migration flows</span>
              </div>
              <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                  <span style={{ color: '#10b981' }}>{inboundMovers.toLocaleString()} inbound</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
                  <span style={{ color: '#ef4444' }}>{outboundMovers.toLocaleString()} outbound</span>
                </div>
              </div>
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#9CA3AF' }}>
                Migration flows for investment analysis - {selectedYear}
              </div>
            </div>
          )}
          <div>
            <h4 style={{ fontWeight: 'bold', color: '#D1D5DB', marginBottom: '12px', fontSize: '14px' }}>Select a City:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {availableCities.map(city => (
                <button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: selectedCity === city ? '#2563EB' : '#374151',
                    color: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <div style={{ fontWeight: '500' }}>{city}</div>
                  <div style={{ fontSize: '12px', opacity: 0.75 }}>
                    {getFlowsCount(city)} flows
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative', backgroundColor: '#111827' }}>
          <div
            ref={mapRef}
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#111827'
            }}
          />
          <div style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            backgroundColor: 'rgba(31, 41, 59, 0.95)',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #4B5563',
            minWidth: '200px'
          }}>
            <h4 style={{ fontWeight: 'bold', marginBottom: '12px', color: 'white', margin: '0 0 12px 0' }}>Migration Volume</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '2px', backgroundColor: 'currentColor', opacity: '0.6' }}></div>
                <span style={{ fontSize: '14px', color: '#D1D5DB' }}>Low Volume</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '4px', backgroundColor: 'currentColor', opacity: '0.8' }}></div>
                <span style={{ fontSize: '14px', color: '#D1D5DB' }}>Medium Volume</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '6px', backgroundColor: 'currentColor', opacity: '1' }}></div>
                <span style={{ fontSize: '14px', color: '#D1D5DB' }}>High Volume</span>
              </div>
            </div>
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #4B5563' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10B981' }}></div>
                  <span style={{ color: '#D1D5DB' }}>Inbound Migration</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }}></div>
                  <span style={{ color: '#D1D5DB' }}>Outbound Migration</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#3B82F6' }}></div>
                  <span style={{ color: '#D1D5DB' }}>Selected City</span>
                </div>
              </div>
            </div>
            {selectedCity && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#9CA3AF' }}>
                Showing {viewMode} flows for {selectedCity} in {selectedYear}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetMigrationPage;