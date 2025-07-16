import React from 'react';
import Plot from 'react-plotly.js';

const SensorChart = ({ 
  sensorsData, 
  title, 
  yAxisLabel, 
  field, 
  onRemoveSensor, 
  compact = false,
  showLegend = true
}) => {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const traces = sensorsData.map((sensor, index) => ({
    x: sensor.data.map(point => point.x),
    y: sensor.data.map(point => point.y),
    type: 'scatter',
    mode: 'lines+markers',
    name: sensor.sensorName,
    line: {
      color: colors[index % colors.length],
      width: compact ? 2 : 3,
    },
    marker: {
      size: compact ? 3 : 4,
      color: colors[index % colors.length],
    },
    hovertemplate: `<b>${sensor.sensorName}</b><br>` +
                   `Time: %{x}<br>` +
                   `${yAxisLabel}: %{y}<br>` +
                   `<extra></extra>`,
  }));

  const layout = {
    title: {
      text: title,
      font: {
        size: compact ? 14 : 16,
        family: 'Inter, sans-serif',
      },
      x: 0,
      xanchor: 'left',
    },
    xaxis: {
      title: compact ? '' : 'Time',
      type: 'date',
      showticklabels: true,
      tickfont: {
        size: compact ? 10 : 12,
      },
      gridcolor: compact ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)',
      showgrid: true,
      zeroline: false,
      showline: true,
      linecolor: 'rgba(0,0,0,0.3)',
    },
    yaxis: {
      title: {
        text: yAxisLabel,
        font: {
          size: compact ? 11 : 13,
        },
      },
      showticklabels: true,
      tickfont: {
        size: compact ? 10 : 12,
      },
      gridcolor: compact ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.2)',
      showgrid: true,
      zeroline: false,
      showline: true,
      linecolor: 'rgba(0,0,0,0.3)',
    },
    legend: {
      orientation: 'v',
      x: 1.02,
      xanchor: 'left',
      y: 1,
      yanchor: 'top',
      bgcolor: 'rgba(255,255,255,0.9)',
      bordercolor: 'rgba(0,0,0,0.2)',
      borderwidth: 1,
      font: {
        size: compact ? 10 : 11,
      },
    },
    margin: {
      l: compact ? 50 : 70,
      r: showLegend ? (compact ? 100 : 120) : (compact ? 20 : 30),
      t: compact ? 40 : 50,
      b: compact ? 40 : 60,
    },
    hovermode: 'x unified',
    showlegend: showLegend,
    plot_bgcolor: 'white',
    paper_bgcolor: 'white',
  };

  const config = {
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: [
      'pan2d',
      'lasso2d',
      'select2d',
      'autoScale2d',
      'hoverClosestCartesian',
      'hoverCompareCartesian',
      'toggleSpikelines',
    ],
    modeBarButtonsToAdd: [
      {
        name: 'Fullscreen',
        icon: {
          width: 1000,
          height: 1000,
          path: 'M250,750L375,875L125,875Z M250,250L375,125L125,125Z M750,750L875,875L875,625L625,875Z M750,250L875,125L875,375L625,125Z',
          transform: 'matrix(1 0 0 -1 0 850)'
        },
        click: function(gd) {
          const elem = gd;
          if (elem.requestFullscreen) {
            elem.requestFullscreen();
          } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen();
          } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen();
          }
        }
      }
    ],
    responsive: true,
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-white to-gray-50 rounded-lg">
      <Plot
        data={traces}
        layout={layout}
        config={config}
        style={{ width: '100%', height: '100%' }}
        useResizeHandler={true}
      />
    </div>
  );
};

export default SensorChart;
