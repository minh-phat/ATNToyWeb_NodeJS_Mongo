import ChartsEmbedSDK from "@mongodb-js/charts-embed-dom";

import "regenerator-runtime/runtime";

const sdk = new ChartsEmbedSDK({
    baseUrl: 'https://charts.mongodb.com/charts-cloud-computing---assignm-qeqsh'
});

const chart1 = sdk.createChart({
    chartId: '63517735-1e8f-47d9-8a09-ebcc7ae5fad0'
})

chart1.render(document.getElementById("chart"));