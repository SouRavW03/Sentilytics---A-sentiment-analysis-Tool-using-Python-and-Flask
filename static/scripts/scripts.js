document.addEventListener("DOMContentLoaded", () => {
    const textareaDiv = document.getElementById("div-textarea");
    const urlDiv = document.getElementById("div-url");
    const mediaDiv = document.getElementById("div-media");

    const showDiv = (divToShow) => {
        [textareaDiv, urlDiv, mediaDiv].forEach(div => div.style.display = "none");
        divToShow.style.display = "block";
    };

    showDiv(textareaDiv); // Default view

    document.getElementById("btn-prompt-text").addEventListener("click", () => showDiv(textareaDiv));
    document.getElementById("btn-prompt-url").addEventListener("click", () => showDiv(urlDiv));
    document.getElementById("btn-prompt-media").addEventListener("click", () => showDiv(mediaDiv));

    document.getElementById("btn-reset").addEventListener("click", () => {
        document.getElementById("sentiment-form").reset();
    });

    document.getElementById("sentiment-form").addEventListener("submit", (e) => {
        e.preventDefault();

        const formData = new FormData();
        let type = "";
        let input = null;

        if (textareaDiv.style.display === "block") {
            input = document.getElementById("form-input-textarea").value;
            type = "text";
        } else if (urlDiv.style.display === "block") {
            input = document.getElementById("form-input-url").value;
            type = "url";
        } else if (mediaDiv.style.display === "block") {
            input = document.getElementById("form-input-media").files[0];
            type = "media";
        }

        if (!input || (typeof input === "string" && input.trim() === "")) {
            alert("Please enter or select input.");
            return;
        }

        formData.append("input", input);
        formData.append("type", type);

        const overlay = document.getElementById("sentiment-overlay");
        const content = document.getElementById("sentiment-overlay-content");

        overlay.style.display = "flex";

        fetch("/", {
            method: "POST",
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                const val_neg = Math.round(data.score_negative * 10000) / 100;
                const val_neu = Math.round(data.score_neutral * 10000) / 100;
                const val_pos = Math.round(data.score_positive * 10000) / 100;

                const sentiment = data.prominent_sentiment.toUpperCase();
                let sentimentColor = "black";

                if (sentiment === "NEGATIVE") sentimentColor = "red";
                else if (sentiment === "POSITIVE") sentimentColor = "green";
                else if (sentiment === "NEUTRAL") sentimentColor = "blue";

                content.innerHTML = `
                <h2>Dominant Sentiment: <strong style="color: ${sentimentColor};">${sentiment}</strong></h2>
                <table>
                    <tr><th>Emotion</th><th>Type</th><th>Value</th></tr>
                    <tr><td>😠</td><td>Negative</td><td>${val_neg}%</td></tr>
                    <tr><td>😐</td><td>Neutral</td><td>${val_neu}%</td></tr>
                    <tr><td>😊</td><td>Positive</td><td>${val_pos}%</td></tr>
                </table>
                <canvas id="sentiment-chart"></canvas>
                <button id="btn-download-chart">Download Chart</button>
            `;

                const ctx = document.getElementById("sentiment-chart").getContext("2d");

                const chart = new Chart(ctx, {
                    type: 'radar',
                    data: {
                        labels: ['Negative', 'Neutral', 'Positive'],
                        datasets: [{
                            label: 'Sentiment Score',
                            data: [val_neg, val_neu, val_pos],
                            backgroundColor: 'rgba(59, 130, 246, 0.3)',
                            borderColor: '#3b82f6',
                            borderWidth: 2
                        }]
                    },
                    options: {
                        responsive: true,
                        layout: {
                            padding: {
                                top: -10 
                            }
                        },
                        scales: {
                            r: {
                                radius: '150%',
                                angleLines: { color: '#e5e7eb' },
                                grid: { color: '#e5e7eb' },
                                pointLabels: {
                                    display: true, 
                                    font: {weight: 'bold', size: 13}
                                },
                                ticks: {
                                    color: '#111827'
                                },
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'top',
                                labels: {
                                    padding: 30,
                                    margin : 30,
                                    font: {
                                        weight: 'bold'
                                    }
                                }
                            }
                        }
                    }
                    ,
                    plugins: [{
                        id: 'customLabelColor',
                        afterDraw(chart) {
                            const ctx = chart.ctx;
                            const scale = chart.scales.r;
                            const labels = chart.data.labels;

                            labels.forEach((label, i) => {
                                const point = scale.getPointPositionForValue(i, scale.max);
                                let xOffset = 0;
                                let yOffset = 0;
                                ctx.save();
                                ctx.restore();
                            });
                        }
                    }]
                });

                document.getElementById("btn-download-chart").addEventListener("click", () => {
                    const link = document.createElement('a');
                    link.download = 'sentiment-chart.png';
                    link.href = chart.toBase64Image();
                    link.click();
                });

            })
            .catch(err => {
                console.error("Error:", err);
                content.innerHTML = `<p style="color:red;">Error analyzing sentiment.</p>`;
            });

        overlay.addEventListener("click", () => {
            overlay.style.display = "none";
        });
    });
});
