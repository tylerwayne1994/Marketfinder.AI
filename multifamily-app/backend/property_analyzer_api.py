import requests
import json
import sys
from pathlib import Path

def test_api_with_minimal_data():
    """
    Test the API with minimal required data to see what it expects
    """
    api_url = "http://127.0.0.1:8000/api/analyze-property"
    
    # Create minimal test data to understand what the API needs
    test_data = {
        "property_data": {
            "address": "test",
            "total_units": 1
        },
        "market_data": {
            "cap_rate": 0.05
        }
    }
    
    print("Testing API with minimal data:")
    print(json.dumps(test_data, indent=2))
    
    response = requests.post(
        api_url,
        json=test_data,
        headers={'Content-Type': 'application/json'}
    )
    
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response: {response.text}")
    
    if response.status_code == 422:
        # Parse validation errors to see what fields are required
        error_detail = response.json()
        print("\n=== API VALIDATION ERRORS ===")
        print(json.dumps(error_detail, indent=2))
        print("\nThe API is expecting these exact fields in the request body.")
    
    return response

def send_property_analysis(property_file_path: str = None):
    """
    Send property data to your API endpoint
    """
    api_url = "http://127.0.0.1:8000/api/analyze-property"
    
    # Build the complete request payload
    # Based on your PDF data structure
    payload = {
        "property_data": {
            "address": "1611 E LAMAR RD",
            "city": "Phoenix", 
            "state": "AZ",
            "zip_code": "85016",
            "property_type": "Multifamily",
            "year_built": 2024,
            "total_units": 4,
            "total_square_feet": 5900,
            "parcel_size": 11468,
            "zoning": "R-3",
            "gross_potential_rent": 171600,
            "vacancy_rate": 0.05,
            "other_income": 4800,
            "effective_gross_income": 167820,
            "total_operating_expenses": 26223,
            "noi": 141597,
            "unit_mix": [
                {
                    "type": "1 Bed - 1 Bath",
                    "count": 2,
                    "unit_sf": 850,
                    "current_rent": 2400
                },
                {
                    "type": "3 Bed - 2 Bath", 
                    "count": 2,
                    "unit_sf": 2110,
                    "current_rent": 4750
                }
            ],
            "operating_expenses": {
                "real_estate_taxes": 3211,
                "insurance": 1700,
                "general_admin": 2050,
                "repairs_maintenance": 4400,
                "utilities": 6400,
                "turnover_marketing": 750,
                "management_fee": 6712,
                "reserves": 1000
            }
        },
        "market_data": {
            "list_price": 2700000,
            "cap_rate": 0.0525,
            "price_per_unit": 675000,
            "price_per_sf": 457.63,
            "cash_on_cash": 0.04,
            "rent_comps": [
                {
                    "name": "LAMAR TOWNHOMES",
                    "address": "1625 E Lamar Rd",
                    "unit_type": "4 Bed 3 Bath",
                    "rent": 4900,
                    "rent_per_sf": 1.88
                },
                {
                    "name": "SACHAR TOWNHOMES",
                    "address": "6616 N 16th St",
                    "unit_type": "4 Bed 3 Bath",
                    "rent": 4750,
                    "rent_per_sf": 1.97
                },
                {
                    "name": "VERDE GARDENS",
                    "address": "13230 N 22nd St",
                    "unit_type": "3 Bed 2 Bath",
                    "rent": 3500,
                    "rent_per_sf": 1.96
                }
            ]
        }
    }
    
    print("="*60)
    print("SENDING PROPERTY ANALYSIS REQUEST")
    print("="*60)
    print(f"API Endpoint: {api_url}")
    print(f"\nRequest Payload:")
    print(json.dumps(payload, indent=2))
    
    try:
        # Send the request
        response = requests.post(
            api_url,
            json=payload,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"\n{'='*60}")
        print(f"Response Status: {response.status_code}")
        print(f"{'='*60}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n✅ SUCCESS! Analysis Results:")
            print(json.dumps(result, indent=2))
            return result
        elif response.status_code == 422:
            print("\n❌ Validation Error:")
            print(response.json())
            print("\nThe API is rejecting the data format. Check your API's expected schema.")
        else:
            print(f"\n❌ Error: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Connection Error: Cannot reach the API")
        print("Make sure your FastAPI server is running on port 8000")
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
    
    return None

def main():
    print("Property Analysis API Client")
    print("-" * 60)
    
    # First test with minimal data to see what the API expects
    print("\n1. Testing API requirements...")
    test_response = test_api_with_minimal_data()
    
    if test_response.status_code != 200:
        print("\n2. Sending full property analysis...")
        result = send_property_analysis()
        
        if result:
            print("\n" + "="*60)
            print("ANALYSIS COMPLETE")
            print("="*60)
            
            # Save results to file
            output_file = "property_analysis_results.json"
            with open(output_file, 'w') as f:
                json.dump(result, f, indent=2)
            print(f"\n✅ Results saved to: {output_file}")

if __name__ == "__main__":
    main()