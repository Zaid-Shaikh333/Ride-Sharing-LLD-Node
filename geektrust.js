
class Driver {
  constructor(id, x, y) {
    this.id = id;
    this.location = { x, y };
    this.availability = true;
  }

  calculateDistance(point) {
    const { x: x1, y: y1 } = this.location;
    const { x: x2, y: y2 } = point;
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return distance.toFixed(2);
  }

  isAvailable() {
    return this.availability;
  }

  markUnavailable() {
    this.availability = false;
  }

  markAvailable() {
    this.availability = true;
  }
}

class Rider {
  constructor(id, x, y) {
    this.id = id;
    this.location = { x, y };
  }

  calculateDistance(point) {
    const { x: x1, y: y1 } = this.location;
    const { x: x2, y: y2 } = point;
    const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    return distance.toFixed(2);
  }
}

class Ride {
  constructor(id, rider, driver) {
    this.id = id;
    this.rider = rider;
    this.driver = driver;
    this.destination = null;
    this.timeTaken = null;
    this.completed = false;
  }

  startRide(destination, timeTaken) {
    this.destination = destination;
    this.timeTaken = timeTaken;
    this.completed = false;
  }

  stopRide() {
    this.completed = true;
  }

  calculateBill() {
    const baseFare = 50;
    const distanceCharge = 6.5 * this.rider.calculateDistance(this.destination);
    const timeCharge = 2 * this.timeTaken;
    const totalAmount = baseFare + distanceCharge + timeCharge;
    const serviceTax = 0.2 * totalAmount;
    const finalAmount = (totalAmount + serviceTax).toFixed(2);

    return finalAmount;
  }
}

class RideSharingApp {
  constructor() {
    this.drivers = [];
    this.riders = [];
    this.rides = [];
  }

  addDriver(id, x, y) {
    const driver = new Driver(id, x, y);
    this.drivers.push(driver);
  }

  addRider(id, x, y) {
    const rider = new Rider(id, x, y);
    this.riders.push(rider);
  }

  matchRider(riderId) {
    const rider = this.riders.find((r) => r.id === riderId);
    if (!rider) {
      console.log('Rider not found');
      return;
    }

    const availableDrivers = this.drivers.filter((d) => d.isAvailable());
    if (availableDrivers.length === 0) {
      console.log('NO_DRIVERS_AVAILABLE');
      return;
    }

    const matchedDrivers = availableDrivers
      .map((driver) => ({
        driver,
        distance: rider.calculateDistance(driver.location),
      }))
      .sort((a, b) => {
        if (a.distance === b.distance) {
          return a.driver.id.localeCompare(b.driver.id);
        }
        return a.distance - b.distance;
      })
      .slice(0, 5)
      .map((item) => item.driver.id);

    console.log('DRIVERS_MATCHED', ...matchedDrivers);
  }

  startRide(rideId, n, riderId) {
    const rider = this.riders.find((r) => r.id === riderId);
    if (!rider) {
      console.log('Rider not found');
      return;
    }

    const matchedDrivers = this.drivers.filter((d) => d.isAvailable());
    if (matchedDrivers.length < n) {
      console.log('INVALID_RIDE');
      return;
    }

    const driver = matchedDrivers[n - 1];
    const existingRide = this.rides.find((r) => r.id === rideId);
    if (existingRide || !driver) {
      console.log('INVALID_RIDE');
      return;
    }

    driver.markUnavailable();
    const ride = new Ride(rideId, rider, driver);
    this.rides.push(ride);
    console.log('RIDE_STARTED', rideId);
  }

  stopRide(rideId, destinationX, destinationY, timeTaken) {
    const ride = this.rides.find((r) => r.id === rideId);
    if (!ride || ride.completed) {
      console.log('INVALID_RIDE');
      return;
    }

    ride.stopRide();
    ride.driver.markAvailable();
    ride.destination = { x: destinationX, y: destinationY };
    ride.timeTaken = timeTaken;

    console.log('RIDE_STOPPED', rideId);
    console.log(ride.driver.availability);
  }

  generateBill(rideId) {
    const ride = this.rides.find((r) => r.id === rideId);
    if (!ride || !ride.completed) {
      console.log('INVALID_RIDE');
      return;
    }

    const amount = ride.calculateBill();
    console.log(`BILL ${rideId} ${ride.driver.id} ${amount}`);
  }
}

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '/sample_input/input1.txt');;



fs.readFile(filePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }
  const inputLines = data.trim().split('\n');
  

const app = new RideSharingApp();

  // Process each input command
  inputLines.forEach((line) => {
    const [command, ...params] = line.trim().split(' ');
  
    // Execute the corresponding command
    switch (command) {
      case 'ADD_DRIVER':
        const [driverId, driverX, driverY] = params;
        app.addDriver(driverId, Number(driverX), Number(driverY));
        break;
      case 'ADD_RIDER':
        let riderIdAdd = params[0]; // Rename the variable to avoid conflicts
        let [riderX, riderY] = params.slice(1);
        app.addRider(riderIdAdd, Number(riderX), Number(riderY));
        break;
      case 'MATCH':
        let riderIdMatch = params[0]; // Rename the variable to avoid conflicts
        app.matchRider(riderIdMatch);
        break;
      case 'START_RIDE':
        const [rideId, n, riderIdStart] = params;
        app.startRide(rideId, Number(n), riderIdStart);
        break;
      case 'STOP_RIDE':
        const [rideIdStop, destX, destY, timeTaken] = params;
        app.stopRide(rideIdStop, Number(destX), Number(destY), Number(timeTaken));
        break;
      case 'BILL':
        const rideIdBill = params[0];
        app.generateBill(rideIdBill);
        break;
      default:
        console.log('Invalid command:', command);
    }
  });
  
});