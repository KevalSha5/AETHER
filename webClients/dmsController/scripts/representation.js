(function(window){

  var Representation = function (canvasElement, width, height) {
    this.g2d;
    this.width = width;
    this.height = height;
    this.init(canvasElement);
  }

  Representation.prototype.init = function (canvasElement) {
    var canvas = document.getElementById(canvasElement);
    canvas.width = this.width;
    canvas.height = this.height;
    this.g2d = canvas.getContext('2d');
    this.g2d.width = canvas.width;
    this.g2d.height = canvas.height;
    this.g2d.clearRect(0, 0, this.g2d.width, this.g2d.height);
    this.g2d.fillStyle = '#cc2222';
    this.g2d.font = '30px Arial';
    this.g2d.textAlign = 'center';
    /*
    console.log('numBuildings', buildingData.arr.length);
    for (var i = 0; i < buildingData.arr.length; i++) {
      var b = buildingData.arr[i];
      this.g2d.fillRect((b.btrx / 2) + 2, (b.btrz / 2) + 6, b.width / 2, b.depth / 2);
    }
    */
  }

  Representation.prototype.renderDrones = function (droneList) {
    this.g2d.clearRect(0, 0, this.g2d.width, this.g2d.height);
    /*
    for (var i = 0; i < droneList.length; i++) {
      //this.g2d.fillRect(
      //  droneList[i].position.x, droneList[i].position.y, 4, 4
      //);
      this.g2d.fillText(i, droneList[i].position.x, droneList[i].position.y);
    }
    */
    for (var drone in droneList) {
      this.g2d.fillText(drone,
        droneList[drone].position.x,
        droneList[drone].position.y
      );
    }

  }

  window.Representation = Representation;

})(window);