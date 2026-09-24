import heatmapJson from './heatMapData.json'
import scatterJson from './scatter.json'
import mapJson from './map.json'
import tTreemapJson from './treemap.json'
import sankeyJson from './sankey.json'
import graphDataJson from './graph.json'

export default {
  // 单图表
  fetchMockSingleData: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: {
    dimensions: ['product', 'dataOne'],
      'source|20': [
        {
          product: '@name',
          'dataOne|0-900': 3
        }
      ]
    }
  },
  // 胶囊图
  fetchCapsule: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: {
      dimensions: ['name', 'value'],
      "source|2-5": [
        { 'name|+1': ["Xiamen","Fuzhou","Beijing","Shanghai","Xinjiang","Zhengzhou","Hunan","Inner Mongolia"], 'value|0-40': 20 },
      ]
    }
  },
  // 图表
  fetchMockData: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: {
      dimensions: ['product', 'dataOne', 'dataTwo', 'dataThree'],
      'source|20': [
        {
          product: '@name',
          'dataOne|100-900': 3,
          'dataTwo|100-900': 3,
          'dataThree|100-900': 3
        }
      ]
    }
  },
  // 排名列表
  fetchRankList: {
    code: 0,
    status: 200,
    msg: 'Success',
    'data|50': [{ name: '@name', 'value|100-900': 5 }]
  },
  // 轮播表格
  fetchScrollBoard: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: [
      ['R1C1', 'R1C2', '1'],
      ['R2C1', 'R2C2', '2'],
      ['R3C1', 'R3C2', '3'],
      ['R4C1', 'R4C2', '4'],
      ['R5C1', 'R5C2', '5'],
      ['R6C1', 'R6C2', '6'],
      ['R7C1', 'R7C2', 'R7C3'],
      ['R8C1', 'R8C2', 'R8C3'],
      ['R9C1', 'R9C2', 'R9C3'],
      ['R10C1', 'R10C2', 'R10C3']
    ]
  },
  // 获取数字-浮点型
  fetchNumberFloat: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: '@float(0, 0.99, 1, 4)'
  },
  // 获取数字-整型
  fetchNumberInt: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: '@integer(0, 100)'
  },
  // 文字
  fetchText: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: '@paragraph(1, 10)'
  },
  // 图片
  fetchImage: (num: number) => ({
    code: 0,
    status: 200,
    msg: 'Success',
    data: `https://robohash.org/${num}`
  }),
  // 雷达
  fetchRadar: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: {
      radarIndicator: [
        { name: '@name', max: 10000 },
        { name: '@name', max: 10000 },
        { name: '@name', max: 10000 },
        { name: '@name', max: 10000 },
        { name: '@name', max: 10000 },
        { name: '@name', max: 10000 }
      ],
      seriesData: [
        {
          value: [
            '@integer(0, 10000)',
            '@integer(0, 10000)',
            '@integer(0, 10000)',
            '@integer(0, 10000)',
            '@integer(0, 10000)',
            '@integer(0, 10000)'
          ],
          name: 'data1'
        },
        {
          value: [
            '@integer(0, 10000)',
            '@integer(0, 10000)',
            '@integer(0, 10000)',
            '@integer(0, 10000)',
            '@integer(0, 10000)',
            '@integer(0, 10000)'
          ],
          name: 'data2'
        }
      ]
    }
  },
  // 热力图
  fetchHeatmap: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: heatmapJson
  },
  // 散点图
  fetchScatterBasic: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: scatterJson
  },
  // 中国地图
  fetchMap: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: mapJson
  },
  // 词云
  fetchWordCloud: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: [
      {
        name: '@name',
        value: 8000,
        textStyle: {
          color: '#78fbb2'
        },
        emphasis: {
          textStyle: {
            color: 'red'
          }
        }
      },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' },
      { name: '@name', value: '@integer(10, 8000)' }
    ]
  },
  // 树图
  fetchTreemap: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: tTreemapJson
  },
  // 三维地球
  threeEarth01Data: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: [
      {
        startArray: { name: '@name', N: '@integer(10, 100)', E: '@integer(10, 100)' },
        'endArray|10': [{ name: '@name', N: '@integer(10, 100)', E: '@integer(10, 100)' }]
      }
    ]
  },
  // 桑基图
  fetchSankey: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: sankeyJson
  },
  // 关系图
  graphData: {
    code: 0,
    status: 200,
    msg: 'Success',
    data: graphDataJson
  },
}
