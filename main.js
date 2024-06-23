// Definición
const nav = document.querySelector("#nav");
const cont_graf = document.querySelector("#cont_graf");
const abrir = document.querySelector("#abrir");
const cerrar = document.querySelector("#cerrar");
const cerrar_2 = document.querySelector("#cerrar_2");
const refresh = document.querySelector("#refresh");
const imgclic = document.querySelector("#imgclic");
const SCAN = document.getElementById("SCAN");
const INICIAR = document.getElementById("INICIAR");
const STOP = document.getElementById("STOP");
const SAVE = document.getElementById("SAVE");
const RESET = document.getElementById("RESET");

const retrievedValue = document.getElementById("valueContainer");
const latestValueSent = document.getElementById("valueSent");
const bleStateContainer = document.getElementById("bleState");
const timestampContainer = document.getElementById("timestamp");
const sampleCountInput = document.getElementById("sampleCount");

SAVE.addEventListener("click", () => {
  const samples = parseInt(sampleCountInput.value);
  const byte1 = (samples >> 8) & 0xff;
  const byte2 = samples & 0xff;
  configCharacteristic.writeValue(new Uint8Array([byte1, byte2]));
});

/* funcionamiento botones*/
abrir.addEventListener("click", () => {
  nav.classList.add("visible");
});
cerrar.addEventListener("click", () => {
  nav.classList.remove("visible");
});
refresh.addEventListener("click", () => {
  document.location.reload();
});
imgclic.addEventListener("click", () => {
  cont_graf.classList.add("visible");
});
cerrar_2.addEventListener("click", () => {
  cont_graf.classList.remove("visible");
});

/*BLE*/

var deviceName = "NEURON-BLE"; // cambia nombre
var bleService = 0xffff;
var VECTOR1Characteristic = 0xfff1; //VECTOR1
var VECTOR2Characteristic = 0xfff2; //VECTOR2
var VECTOR3Characteristic = 0xfff3; //VECTOR3
var VECTOR4Characteristic = 0xfff4; //VECTOR4
var VECTOR5Characteristic = 0xfff5; //VECTOR5
var VECTOR6Characteristic = 0xfff6; //VECTOR6
var VECTOR7Characteristic = 0xfff7; //VECTOR7
var VECTOR8Characteristic = 0xfff8; //VECTOR8

var TVECTORCharacteristic = 0xff12; //NUMERO DE MUESTRAS
var INICIOCharacteristic = 0xff13; //INICIO

// Variables globales
var bleServer;
var bleServiceFound;
var VECTOR1CharacteristicFound;
var VECTOR2CharacteristicFound;
var VECTOR3CharacteristicFound;
var VECTOR4CharacteristicFound;
var VECTOR5CharacteristicFound;
var VECTOR6CharacteristicFound;
var VECTOR7CharacteristicFound;
var VECTOR8CharacteristicFound;
var TVECTORCharacteristicFound;
var INICIOCharacteristicFound;
var configCharacteristic;

SCAN.addEventListener("click", (event) => {
  if (isWebBluetoothEnabled()) {
    connectToDevice();
  }
});

function isWebBluetoothEnabled() {
  if (!navigator.bluetooth) {
    console.log("¡La API Web Bluetooth no está disponible en este navegador!");
    bleStateContainer.innerHTML =
      "¡La API Web Bluetooth no está disponible en este navegador!";
    return false;
  }
  console.log("API Web Bluetooth soportada en este navegador.");
  return true;
}

INICIAR.addEventListener("click", () => {
  INICIOCharacteristic.writeValue(new Uint8Array([1]));
  console.log("Valor leído: ", writeValue, value);
});

STOP.addEventListener("click", () => {
  disconnectDevice()
});

function handleCharacteristicValueChanged(event) {
  console.log("UPDATE", event.target, event);
  const value = event.target.value;
  const data = new Uint8Array(value.buffer);
  console.log("Data: ", new Uint16Array(value.buffer));
  console.log("Valor leído: ", data, value);
}

function connectToDevice() {
  navigator.bluetooth
    .requestDevice({
      filters: [{ name: deviceName }],
      optionalServices: [bleService],
    })
    .then((device) => {
      bleStateContainer.innerHTML = "Conectado " + device.name;
      bleStateContainer.style.color = "#24af37";

      //   device.addEventListener('gattservicedisconnected', onDisconnected);
      return device.gatt.connect();
    })
    .then((gattServer) => {
      bleServer = gattServer;
      console.log("Conectado al servidor GATT");
      return bleServer.getPrimaryService(bleService);
    })
    .then(async (service) => {
      bleServiceFound = service;
      console.log("Servicio descubierto:", service.uuid);
      await service
        .getCharacteristic(TVECTORCharacteristic)
        .then((characteristic) => {
          configCharacteristic = characteristic;
          console.log("Config characteristic found: ", characteristic.uuid);
        });
      await service
        .getCharacteristic(INICIOCharacteristic)
        .then((characteristic) => {
          INICIOCharacteristic = characteristic;
          console.log(
            "INICIOCharacteristic characteristic found: ",
            characteristic.uuid
          );
        });

      for (let index = 0; index < 8; index++) {
        await service
          .getCharacteristic(VECTOR1Characteristic + index)
          .then(async (characteristic) => {
            characteristic.oncharacteristicvaluechanged =
              handleCharacteristicValueChanged;
            await characteristic.startNotifications();
            await characteristic.readValue();
            console.log(
              "VECTOR1Characteristic characteristic found: ",
              characteristic.uuid
            );
          });
      }
    })
    .catch((error) => {
      console.error("Error al conectar:", error);
    });
}

if (bleServer && bleServer.connected) {
  bleServiceFound
    .getCharacteristic(INICIOCharacteristic)
    .then((characteristic) => {
      console.log("Found the on characteristic: ", characteristic.uuid);
      const data = new Uint8Array([value]);
      return characteristic.writeValue(data);
    })
    .then(() => {
      latestValueSent.innerHTML = value;
      console.log("Value written to INICIOCharacteristic:", value);
    });
}

function getDateTime() {
  const now = new Date();
  return now.toLocaleString();
}

function disconnectDevice() {
  console.log("Disconnect Device.");
  if (bleServer && bleServer.connected) {
    if (sensorCharacteristicFound) {
      sensorCharacteristicFound
        .stopNotifications()
        .then(() => {
          console.log("Notifications Stopped");
          return bleServer.disconnect();
        })
        .then(() => {
          console.log("Device Disconnected");
          bleStateContainer.innerHTML = "Device Disconnected";
          bleStateContainer.style.color = "#d13a30";
        })
        .catch((error) => {
          console.log("An error occurred:", error);
        });
    } else {
      console.log("No characteristic found to disconnect.");
    }
  } else {
    // Throw an error if Bluetooth is not connected
    console.error("Bluetooth is not connected.");
    window.alert("Bluetooth is not connected.");
  }
}

/* Gráficos */

function createRandomVector(size) {
  let vector = [];
  for (let i = 0; i < size; i++) {
      vector.push(Math.random() * 5000 - 2500); // Ajustar el rango a -1000 a 1000
  }
  return vector;
}

// Función NLMS
function nlms(xx, dd, alfa, M, HE) {
  const N = xx.length;           // Número de iteraciones a realizar
  let XE = math.zeros(M)._data;  // Buffer de la señal de entrada
  let y = math.zeros(N)._data;   // Señal de salida filtrada
  let epri = math.zeros(N)._data; // Señal de error
  let HE1 = math.zeros(M, N)._data; // Historia de coeficientes

  for (let n = 0; n < N; n++) {
      HE1.map((row, index) => HE1[index][n] = HE[index]); // Almacenar los coeficientes actuales

      // Actualizar el buffer de entrada
      XE = [xx[n]].concat(XE.slice(0, M - 1));
      
      // Calcular la salida del filtro
      y[n] = math.dot(HE, XE);
      
      // Calcular la señal de error
      epri[n] = dd[n] - y[n];

      // Actualizar los coeficientes del filtro
      const denominator = math.dot(XE, XE) + Number.EPSILON;
      const numerator = alfa * epri[n];
      const update = XE.map(x => (numerator * x) / denominator);
      HE = HE.map((h, i) => h + update[i]);
  }

  return { epri, HE1, y };
}

// Lista de claves de vectores en el JSON
const vectorKeys = ['FP1', 'FC3', 'F3', 'FC4', 'FP2', 'FZ'];
let randomVectors = {};

// Función para generar y actualizar el gráfico
function generateChart() {
  // Obtener el tamaño del vector del input
  const sampleCount = document.getElementById('sampleCount').value;

  // Leer el archivo JSON
  fetch('PRVECTOR.json')
      .then(response => response.json())
      .then(data => {
          console.log('Datos del JSON:', data);

          let datasets = [];

          vectorKeys.forEach(key => {
              if (data[key]) {
                  let originalVector = data[key];
                  let randomVector = createRandomVector(sampleCount);
                  randomVectors[key] = randomVector;

                  datasets.push({
                      label: `vector ${key}`,
                      data: randomVector,
                      borderColor: getRandomColor(),
                      fill: false
                  });
              } else {
                  console.error(`No se encontró el vector ${key} en el JSON`);
              }
          });

          // Crear el gráfico
          const ctx = document.getElementById('secondChart').getContext('2d');
          new Chart(ctx, {
              type: 'line',
              data: {
                  labels: Array.from({ length: sampleCount }, (_, i) => i + 1),
                  datasets: datasets
              },
              options: {
                  responsive: true,
                  scales: {
                      x: {
                          title: {
                              display: true,
                              text: 'Índice'
                          }
                      },
                      y: {
                          title: {
                              display: true,
                              text: 'Valor'
                          }
                      }
                  }
              }
          });
      })
      .catch(error => console.error('Error al leer el archivo JSON:', error));
}

// Función para aplicar el filtro NLMS y generar el gráfico de error
function applyNLMS() {
  const alfa = 0.01;
  const M = 2;
  const HE = new Array(M).fill(0);

  let errorDatasets = [];

  const selectedSignal = document.getElementById('Select-signal').value;
  const sampleCount = document.getElementById('sampleCount').value;

  if (selectedSignal && randomVectors[selectedSignal]) {
      let randomVector = randomVectors[selectedSignal].slice(0, sampleCount);
      let desiredVector = createRandomVector(randomVector.length); // Simulación de datos deseados

      const { epri, HE1, y } = nlms(randomVector, desiredVector, alfa, M, HE);

      errorDatasets.push({
          label: `Error NLMS para ${selectedSignal}`,
          data: epri,
          borderColor: getRandomColor(),
          fill: false
      });

      // Crear el gráfico de errores
      const ctx = document.getElementById('thirdChart').getContext('2d');
      new Chart(ctx, {
          type: 'line',
          data: {
              labels: Array.from({ length: epri.length }, (_, i) => i + 1),
              datasets: errorDatasets
          },
          options: {
              responsive: true,
              scales: {
                  x: {
                      title: {
                          display: true,
                          text: 'Índice'
                      }
                  },
                  y: {
                      title: {
                          display: true,
                          text: 'Error'
                      }
                  }
              }
          }
      });
  } else {
      alert("Selecciona una señal válida.");
  }
}

// Función para generar colores aleatorios
function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

// Asignar el evento click al botón para generar el gráfico
document.getElementById('flt1').addEventListener('click', generateChart);
// Asignar el evento click al botón para aplicar el filtro NLMS
document.getElementById('flt3').addEventListener('click', applyNLMS);
