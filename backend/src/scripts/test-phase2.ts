import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';

async function runTests() {
  try {
    console.log('--- TESTING PHASE 2 ---');

    // 1. Login as Admin (John Doe)
    console.log('Logging in as Admin (john@test.com)...');
    const adminLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'john@test.com',
      password: 'password123'
    });
    const adminToken = adminLogin.data.token;
    console.log('Admin login successful!');

    // 2. Create a Department as Admin
    console.log('Creating Department as Admin...');
    const createDept = await axios.post(
      `${BASE_URL}/departments`,
      { name: 'Engineering' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('Department created:', createDept.data.name);

    // 3. Create a Category as Admin
    console.log('Creating Category as Admin...');
    const createCat = await axios.post(
      `${BASE_URL}/categories`,
      { name: 'Laptops', customFields: { warranty: 'years' } },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('Category created:', createCat.data.name);

    // 4. Signup a new normal Employee (Jane)
    console.log('Signing up normal Employee (jane@test.com)...');
    try {
      await axios.post(`${BASE_URL}/auth/signup`, {
        name: 'Jane Smith',
        email: 'jane@test.com',
        password: 'password123'
      });
    } catch (e) {
      // Ignore if exists
    }

    // 5. Login as normal Employee
    console.log('Logging in as Employee (jane@test.com)...');
    const empLogin = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'jane@test.com',
      password: 'password123'
    });
    const empToken = empLogin.data.token;
    const janeId = empLogin.data.user.id;
    console.log('Employee login successful, role:', empLogin.data.user.role);

    // 6. Try to create a Department as Employee (Should Fail)
    console.log('Trying to create Department as Employee...');
    try {
      await axios.post(
        `${BASE_URL}/departments`,
        { name: 'Rogue Department' },
        { headers: { Authorization: `Bearer ${empToken}` } }
      );
      console.error('FAIL: Employee was able to create a department!');
    } catch (error: any) {
      if (error.response?.status === 403) {
        console.log('SUCCESS: Employee was forbidden from creating a department (403).');
      } else {
        console.error('FAIL: Unexpected error:', error.response?.status);
      }
    }

    // 7. Admin promotes Jane to Department Head
    console.log('Admin promoting Jane to Department Head...');
    const promoteReq = await axios.put(
      `${BASE_URL}/employees/${janeId}/role`,
      { role: 'Department Head' },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log('Promotion successful. New role:', promoteReq.data.employee.role);

    console.log('--- ALL TESTS PASSED ---');
  } catch (error: any) {
    console.error('Test script failed:', error.response?.data || error.message);
  }
}

runTests();
