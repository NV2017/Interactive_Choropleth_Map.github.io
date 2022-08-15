let educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
let countyURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

let educationData;
let countyData;

let canvas = d3.select('#canvas');

const screenScale = 1;
const width = window.screen.width*screenScale;
const height = window.screen.height*screenScale;
const padding = height*0.2;

const legendColors = ["rgb(60,0,0)","rgb(60,63.75,31.875)","rgb(60,127.5,63.75)",
                      "rgb(60,255,127.5)","rgb(60,255,255)"];
const legendTextList = ["0%","25%","50%","75%","100%"];

let generateLegend = (svg_element,legendColors,legendTextList) => {
  svg_element.append(d3.creator("g"))
             .attr("id","legend")
             .selectAll('rect')
             .data(legendColors)
             .enter()
             .append('rect')
             .attr('y',"1rem")
             .attr('x',(item,index)=>37+index*3+"rem")
             .attr("class","legendBox")
             .attr("width", "3rem")
             .attr("height", "1rem")
             .style("fill",item=>item)
						 .attr('stroke', 'black');

  svg_element.append("g")
            .attr("class","legendText")
            .selectAll('text')
            .data(legendTextList)
            .enter()
            .append('text')
            .attr('y',"3rem")
            .attr('x',(item,index)=>38+index*3+"rem")
            .text((d,i)=>legendTextList[i])
            .attr('stroke', 'black')
            .attr("font-size","0.7rem")
}

let drawFig = () => {
  // canvas.insert('svg')
  //       .attr("width",width)
  //       .attr("height",height)
  //       .attr("class","county")

  let tooltip_div = d3.select("#container")
        							.append("div")
        							.attr("class", "tooltip")
        							.attr("id", "tooltip")
        							.style("opacity", 0);

  canvas.selectAll('path')
        .data(countyData)
        .enter()
        .append('path')
        .attr("d",d3.geoPath())
        .attr("class","county")
        .attr("fill",(countyDataItem) => {
          let id = countyDataItem['id'];
          let county = educationData.find((item)=>{return item['fips'] === id});
          let percentage = county['bachelorsOrHigher'];
          let tempColor = "rgb(60,"+255*percentage*0.02+","+255*percentage*0.01+")";
          return tempColor;
        })
        .attr("data-fips",(countyDataItem)=>countyDataItem['id'])
        .attr("data-education",(countyDataItem)=>{
          let id = countyDataItem['id'];
          let county = educationData.find((item)=>{return item['fips'] === id});
          let percentage = county['bachelorsOrHigher'];
          return percentage;
        })
        .on("mouseover", (countyDataItem) => {
          let id = countyDataItem['id'];
          let county = educationData.find((item)=>{return item['fips'] === id});
          let percentage = county['bachelorsOrHigher'];
          let state = county['state'];
          let area_name = county['area_name'];

          tooltip_div.transition()
                     .duration(100)
                     .style("opacity", 0.5);
          tooltip_div.html("<span class='dataEducation'>" + percentage + "% educated" + "</span><br>" +
              "<span class='areaName'>Area: " + area_name + "</span><br>"+
              "<span class='state'>State: " + state + "</span>")
            .style("left", (d3.event.pageX - ($('.tooltip').width())) + "px")
            .style("top", (d3.event.pageY - 130) + "px");
          tooltip_div.attr("data-education",percentage);
        })
        .on("mouseout", (countyDataItem) => {
          tooltip_div.transition()
            .duration(200)
            .style("opacity", 0);
        });
}

d3.json(countyURL).then(
  (data, error) => {
    if(error){
      console.log(error);
    }else{
      countyData = topojson.feature(data,data.objects.counties).features;  // converting topojson to geojson
      console.log("Received county data");

      d3.json(educationURL).then(
        (data, error) => {
          if(error){
            console.log(error);
          }else{
            educationData = data;
            console.log("Received education data");

            drawFig();

            generateLegend(d3.select("svg"),legendColors,legendTextList);

            generateTooltips();
          }
        }
      )
    }
  }
)
