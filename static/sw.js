const default_filters = [
    {
      name: "gamma",
      imageData: null,
      beforeImageData: null
    },
    {
      name: "level", //色阶
      imageData: null,
      beforeImageData: null
    }
  ]

const filtersMap = new Map()

onmessage = async (e) => {
  const {
    id,
    type,
    imageData,
    params
  } = e.data

  if (type === "initFiltersMap") {
    initFiltersMap()
    console.log("initFiltersMap...")
    postMessage("success")
    return
  }

  let filters;
  let preParams;
  if (filtersMap.has(id)) {
    filters = filtersMap.get(id).filters
    preParams = filtersMap.get(id).params
  } else {
    filters = [
      {
        name: "gamma",
        imageData: null,
        beforeImageData: null
      },
      {
        name: "level", //色阶
        imageData: null,
        beforeImageData: null
      }
    ]
    filtersMap.set(id, {filters, params})
  }

  if (type === "initFilters") {
    console.log("initFilters...")
    initFilters(filters)
    postMessage("success")
    return
  }

  if (!preParams || Object.keys(preParams).some(key => preParams[key] !== params[key])) {
    let index1 = 0;
    let resetFiltersExcluedResetIndex = -1;
    if (type !== "all") {
      index1 = filters.findIndex(filter => filter.name === type)
      resetFiltersExcluedResetIndex = 0
    }
    const index2 = filters.findIndex((filter, i) => !filter.imageData || (i > 0 && !filter.beforeImageData))
    const index = Math.min(index1, index2)
    const resetFilters = filters.splice(index, filters.length - index)
    const len = resetFilters.length;
    
    if (len > 1) {
      const targetFilter = resetFilters.shift()
      resetFilters[0].imageData = targetFilter.imageData
      resetFilters[0].beforeImageData = targetFilter.beforeImageData
      resetFilters.push(targetFilter)
    }
    
    initFilters(resetFilters, resetFiltersExcluedResetIndex)

    console.log(`【${id.length > 13 ? "..." + id.slice(-10) : id}】 process filters: ${filters.map(i => i.name).concat(resetFilters.map(i => i.name)).join("->")},`, `params: ${JSON.stringify(params)}`)

    for (let i = 0; i < len; i++) {
      const filter = resetFilters[i];
      switch (filter.name) {
        case "gamma": 
        filter.imageData = gammaCorrection({imageData: filter.beforeImageData??imageData,...params});
        break;
        case 'level':
          filter.imageData = adjustLevel({imageData: filter.beforeImageData??imageData,...params});
          break;
        }
        if (i+1<len) {
          resetFilters[i+1].beforeImageData = filter.imageData;
        }
    } 
    filters = filters.concat(resetFilters)
  }  else {
    console.log(`${id} skip filter`)
  }

  filtersMap.set(id, {filters, params})
  const res = filters[filters.length - 1].imageData ?? imageData;
  const bitMap = await createImageBitmap(res)
  postMessage(bitMap)
}

function gammaCorrection({imageData,gamma}) {
  const invGamma = 1 / gamma
  const data = imageData.data
  if (gamma === 1) {
    return imageData
  }
  for (let i = 0; i < data.length; i += 4) {
    for (let index = i; index < i+3; index++) {
      data[index] = 255 * Math.pow((data[index] / 255), invGamma);
    }
  }
  return imageData
}

function adjustLevel({imageData, ...params}) {
  const data = imageData.data
  const { inputShadow, inputHighlight, inputMidtones, outputShadow, outputHighlight } = params 
  if ([inputShadow, inputHighlight, outputShadow, outputHighlight].join("") === "02550255" && inputMidtones===1) {
    return imageData
  }
  for (let i = 0; i < data.length; i += 4) {
    for (let index = i; index < i+3; index++) {
      let input_map_color = clamp(
        ((data[index] - inputShadow) /
        (inputHighlight - inputShadow)) *
        255
      );
      // const input_map_color = clamp(
      //   data[index] - inputShadow
      // );
      // data[index] = clamp(color,inputShadow, inputHighlight);
      const mid_color =
        (input_map_color / 255) ** (1 / inputMidtones) * 255;
      const output_map_color =
        (mid_color / 255) * (outputHighlight - outputShadow) +
        outputShadow;
      data[index] = clamp(output_map_color);  
    }
    
  }
  return imageData
}


function initFilters(arr, excludeIndex = -1) {
  arr.forEach((filter, index) => {
    filter.imageData = null;
    if (index !== excludeIndex) {
      filter.beforeImageData = null;
    }
  })
}

function clamp(val, min = 0, max = 255) {
  return Math.max(min, Math.min(max, val));
}

function initFiltersMap() {
  filtersMap.clear()
}
