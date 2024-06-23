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
