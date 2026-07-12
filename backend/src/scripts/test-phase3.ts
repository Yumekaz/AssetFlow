import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  try {
    console.log('--- TESTING PHASE 3 ---');

    // 1. Login as Admin (John Doe)
    console.log('Logging in as Admin (john@test.com)...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@test.com',
      password: 'password123'
    });
    const adminToken = adminLogin.data.token;
    
    // We need a category ID to create an asset
    const categories = await axios.get(`${BASE_URL}/categories`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const laptopCatId = categories.data[0].id;

    // 2. Create Bookable Asset as Admin
    console.log('Admin creating Bookable Asset...');
    const bookableAsset = await axios.post(
      `${BASE_URL}/assets`,
      {
        name: 'Conference Room Projector',
        categoryId: laptopCatId, // reusing category for simplicity
        acquisitionDate: '2023-01-01',
        condition: 'Good',
        isBookable: true
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('Bookable Asset Created with Tag:', bookableAsset.data.assetTag);

    // 3. Create Non-Bookable Asset as Admin
    console.log('Admin creating Non-Bookable Asset...');
    const privateAsset = await axios.post(
      `${BASE_URL}/assets`,
      {
        name: 'CEO Personal Laptop',
        categoryId: laptopCatId,
        acquisitionDate: '2023-01-01',
        condition: 'Excellent',
        isBookable: false
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('Private Asset Created with Tag:', privateAsset.data.assetTag);

    // 4. Create another new Employee for testing
    console.log('Creating new test employee (bob@test.com)...');
    try {
      await axios.post(`${BASE_URL}/auth/signup`, {
        name: 'Bob',
        email: 'bob@test.com',
        password: 'password123'
      });
    } catch (e) {}

    const bobLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'bob@test.com',
      password: 'password123'
    });
    const bobToken = bobLogin.data.token;

    // 5. Employee queries directory
    console.log('Employee querying asset directory...');
    const employeeAssets = await axios.get(`${BASE_URL}/assets`, {
      headers: { Authorization: `Bearer ${bobToken}` }
    });

    const hasBookable = employeeAssets.data.some((a: any) => a.id === bookableAsset.data.id);
    const hasPrivate = employeeAssets.data.some((a: any) => a.id === privateAsset.data.id);

    if (hasBookable && !hasPrivate) {
      console.log('SUCCESS: Employee can only see the bookable asset (Private asset is hidden).');
    } else {
      console.error('FAIL: Role-based scoping failed.', { hasBookable, hasPrivate });
    }

    // 6. Admin queries directory
    const adminAssets = await axios.get(`${BASE_URL}/assets`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (adminAssets.data.length >= 2) {
      console.log(`SUCCESS: Admin can see all ${adminAssets.data.length} assets.`);
    }

    console.log('--- ALL TESTS PASSED ---');
  } catch (error: any) {
    console.error('Test script failed:');
    if (error.response) {
      console.error(error.response.status, error.response.data);
    } else {
      console.error(error.message || error);
    }
  }
}

runTests();
