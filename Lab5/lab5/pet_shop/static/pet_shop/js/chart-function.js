(function() {
    let chart = null;
    const buildChartBtn = document.getElementById('build-chart-btn');
    const saveChartBtn = document.getElementById('save-chart-btn');
    const chartCanvas = document.getElementById('function-chart');
    const dataTableBody = document.getElementById('data-table-body');
    const chartDataTable = document.getElementById('chart-data-table');

    function calculateSeries(x, n) {
        if (Math.abs(x) <= 1) {
            return null;
        }

        let sum = 0;
        for (let i = 0; i <= n; i++) {
            const term = 1 / ((2 * i + 1) * Math.pow(x, 2 * i + 1));
            sum += term;
        }
        return 2 * sum;
    }

    function calculateMathFunction(x) {
        if (Math.abs(x) <= 1) {
            return null;
        }
        try {
            if (typeof math !== 'undefined') {
                const numerator = math.add(x, 1);
                const denominator = math.subtract(x, 1);
                const fraction = math.divide(numerator, denominator);
                return math.log(fraction);
            } else {
                return Math.log((x + 1) / (x - 1));
            }
        } catch (e) {
            return null;
        }
    }

    function generateData(xMin, xMax, pointsCount, nTerms) {
        const data = [];
        const step = (xMax - xMin) / (pointsCount - 1);

        for (let i = 0; i < pointsCount; i++) {
            const x = xMin + i * step;
            const seriesValue = calculateSeries(x, nTerms);
            const mathValue = calculateMathFunction(x);

            if (seriesValue !== null && mathValue !== null) {
                data.push({
                    x: x,
                    series: seriesValue,
                    math: mathValue,
                    n: nTerms
                });
            }
        }

        return data;
    }

    function buildChart(data) {
        if (chart) {
            chart.destroy();
        }

        const ctx = chartCanvas.getContext('2d');
        
        const xValues = data.map(d => d.x);
        const seriesValues = data.map(d => d.series);
        const mathValues = data.map(d => d.math);

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: xValues.map(x => x.toFixed(2)),
                datasets: [
                    {
                        label: 'F(x) (разложение в ряд)',
                        data: seriesValues,
                        borderColor: 'rgb(52, 152, 219)',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 2,
                        pointHoverRadius: 4
                    },
                    {
                        label: 'Math F(x)',
                        data: mathValues,
                        borderColor: 'rgb(231, 76, 60)',
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                        borderWidth: 2,
                        fill: false,
                        tension: 0.1,
                        pointRadius: 2,
                        pointHoverRadius: 4,
                        borderDash: [5, 5]
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 3000,
                    easing: 'easeInOutQuart',
                    onProgress: function(animation) {
                        const progress = Math.round(animation.currentStep / animation.numSteps * 100);
                    },
                    onComplete: function() {
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'График функции ln((x+1)/(x-1))',
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        color: 'var(--text-color)',
                        padding: {
                            top: 10,
                            bottom: 20
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 15,
                            font: {
                                size: 14
                            },
                            color: 'var(--text-color)'
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += context.parsed.y.toFixed(6);
                                }
                                return label;
                            }
                        }
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'x',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            color: 'var(--text-color)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: 'var(--text-color)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'F(x)',
                            font: {
                                size: 14,
                                weight: 'bold'
                            },
                            color: 'var(--text-color)'
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: 'var(--text-color)'
                        }
                    }
                }
            }
        });

        displayDataTable(data);
        saveChartBtn.disabled = false;
    }

    function displayDataTable(data) {
        dataTableBody.innerHTML = '';
        
        data.forEach((point, index) => {
            if (index % Math.ceil(data.length / 20) === 0 || index === data.length - 1) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${point.x.toFixed(4)}</td>
                    <td>${point.series.toFixed(6)}</td>
                    <td>${point.n}</td>
                    <td>${point.math.toFixed(6)}</td>
                `;
                dataTableBody.appendChild(row);
            }
        });

        chartDataTable.style.display = 'block';
    }

    function saveChart() {
        if (!chart) {
            alert('Сначала постройте график');
            return;
        }

        const url = chartCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'function-chart.png';
        link.href = url;
        link.click();
    }

    buildChartBtn.addEventListener('click', function() {
        const xMin = parseFloat(document.getElementById('x-min').value);
        const xMax = parseFloat(document.getElementById('x-max').value);
        const nTerms = parseInt(document.getElementById('n-terms').value);
        const pointsCount = parseInt(document.getElementById('points-count').value);

        if (xMin >= xMax) {
            alert('X min должен быть меньше X max');
            return;
        }

        if (xMin <= 1) {
            alert('X min должен быть больше 1 (|x| > 1)');
            return;
        }

        if (nTerms < 1 || nTerms > 100) {
            alert('Количество членов ряда должно быть от 1 до 100');
            return;
        }

        if (pointsCount < 10 || pointsCount > 200) {
            alert('Количество точек должно быть от 10 до 200');
            return;
        }

        const data = generateData(xMin, xMax, pointsCount, nTerms);
        
        if (data.length === 0) {
            alert('Не удалось сгенерировать данные. Убедитесь, что все значения x > 1');
            return;
        }

        buildChart(data);
    });

    saveChartBtn.addEventListener('click', saveChart);
})();

