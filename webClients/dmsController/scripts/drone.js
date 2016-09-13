(function(window){
	
  var Drone = function (id, x, y, state) {
    this.id = id;
    this.position = {x: x, y: y};
    this.logicalPosition = {x: x, y: y};
    this.state = state;
    this.power = 1500;
    this.velocity = {x: 1, y: 1};
    this.birthDate = 500 * Math.random() * performance.now();
    this.hoverRadius = 15;
    this.randomKernal = Math.random();
    this.resetVelocity();
    this.velocityMult = 1;
  }

  Drone.prototype.setState = function (state) {
    this.state = state;
    switch (this.state) {
      case 'outOfPower':
        //
        break;
      case 'idle':
        //
        break;
      case 'surveyPowerLines':
        //
        break;
      case 'environmentalHazard':
        //
        break;
      case 'browse':
        //
        this.resetVelocity();
        break;
      default:
        //---
        break;
    }
  }

  Drone.prototype.resetVelocity = function () {
    this.velocity.x = this.getPosNeg() * Math.random();
    this.velocity.y = this.getPosNeg() * Math.random();
  }

  Drone.prototype.getPosNeg = function () {
    if (Math.random() < 0.5) {
      return -1;
    } else {
      return 1;
    }
  }

  Drone.prototype.update = function () {
    /*
    if (--this.power <= 0) {
      this.state = 'outOfPower';
      return;
    }
    */
    this.stateManager();
    //this.position.x += this.velocity.x;
    //this.position.y += this.velocity.y;
  }

  Drone.prototype.stateManager = function () {
    switch (this.state) {
      case 'outOfPower':
        //do nothing
        break;
      case 'idle':
        //hover in circle
        this.hover();
        break;
      case 'surveyPowerLines':
        //travel up and down power line
        this.surveyPower();
        break;
      case 'environmentalHazard':
        //hover around trash site
        this.monitorTrash();
        break;
      case 'browse':
        //just fly around
        this.browse();
        break;
      default:
        //---
        break;
    }
  }

  Drone.prototype.hover = function () {
    var totalTime = performance.now() - this.birthDate;
    this.position.x = this.logicalPosition.x + 
      (this.hoverRadius * Math.cos(0.001 * totalTime));
    this.position.y = this.logicalPosition.y + 
      (this.hoverRadius * Math.sin(0.001 * totalTime));
  }

  Drone.prototype.surveyPower = function () {
    //if drone is near powerline, go there
    if (Math.abs(this.position.x - locations.powerLine) > 10) {
      if (this.position.x > locations.powerLine) {
        this.position.x -= this.velocityMult;
      }
      else {
        this.position.x += this.velocityMult;
      }
      this.logicalPosition.x = this.position.x;
    }
    //otherwise, just travel up and down powerline
    else {
      if (this.velocity.y > 0) {
        this.position.y += this.velocityMult;
      } else {
        this.position.y -= this.velocityMult;
      }
      //this.position.y += this.velocity.y;
      this.logicalPosition.y = this.position.y;
      if (this.position.y <= 0 || this.position.y >= 500) {
        this.velocity.y *= -1;
      }
    }
  }

  Drone.prototype.monitorTrash = function () {
    if (this.getDistance(locations.trash.x, locations.trash.y) > 5) {
      //go to trash
      var x = locations.trash.x - this.logicalPosition.x;
      var y = locations.trash.y - this.logicalPosition.y;
      this.normalizeVelocityVector(x, y);
      this.position.x += (this.velocityMult * this.velocity.x);
      this.position.y += (this.velocityMult * this.velocity.y);
      this.logicalPosition.x = this.position.x;
      this.logicalPosition.y = this.position.y;
    }
    else {
      //hover around trash
      this.hover();
    }
  }

  Drone.prototype.browse = function () {
    this.position.x += (this.velocityMult * this.velocity.x);
    this.position.y += (this.velocityMult * this.velocity.y);
    this.logicalPosition.x = this.position.x;
    this.logicalPosition.y = this.position.y;
    if (this.position.x <= 0 || this.position.x >= 500) {
      this.velocity.x *= -1;
    }
    if (this.position.y <= 0 || this.position.y >= 500) {
      this.velocity.y *= -1;
    }
    //give it a chance to randomly change directions
    if (Math.random() < 0.0005) {
      this.velocity.x *= -1;
    }
    if (Math.random() < 0.0005) {
      this.velocity.y *= -1;
    }
  }

  Drone.prototype.normalizeVelocityVector = function (x, y) {
    var magnitude = Math.sqrt(x * x + y * y);
    x /= magnitude;
    y /= magnitude;
    this.velocity.x = x;
    this.velocity.y = y;
  }

  Drone.prototype.getDistance = function (goalX, goalY) {
    var x = Math.pow(this.logicalPosition.x - goalX, 2);
    var y = Math.pow(this.logicalPosition.y - goalY, 2);
    return Math.sqrt(x + y);
  }

  window.Drone = Drone;

})(window);