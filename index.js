const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

//https://cn.wowhead.com/tooltip/spell/288749&lvl=350&json&power

//获取艾泽利特护甲信息列表
const getAZAItemList = $ => {
  let script = $("script")
    .toArray()
    .filter(o => {
      if (o.children.length > 0) {
        if (o.children) {
          return o.children[0].data.indexOf("PageTemplate.set({breadcrumb") > 0;
        }
      }
    })[0].children[0].data;

  let list;

  script = script
    .substr(script.indexOf("WH.Gatherer.addData"))
    .replace("WH.Gatherer.addData", "list=");
  eval(script);

  return list;
};

//获取装备信息列表
const getItemList = $ => {
  let script = $("script")
    .toArray()
    .filter(o => {
      if (o.children.length > 0) {
        if (o.children) {
          return o.children[0].data.indexOf("new Listview") > 0;
        }
      }
    })[0].children[0].data;

  let list;

  script = script.replace("new Listview", "list=");
  eval(script);

  return list;
};

//获取艾泽利特特质归类表
const getClassAZAAZList = $ => {
  let script = $("script")
    .toArray()
    .filter(o => {
      if (o.children.length > 0) {
        if (o.children) {
          return o.children[0].data.indexOf("WH.Wow.AzeriteFinder") > 0;
        }
      }
    })[0].children[0].data;

  let list;
  let buildList = (a, b, c) => {
    list = b;
  };

  script = "buildList" + script.substr(script.indexOf("})") + 2);
  eval(script);

  return list;
};

const getClassAZList = $ => {
  let classAZlist = {};
  $(".azerite-finder-spell-list").each((index, c) => {
    c = $(c);

    let classId = c.data("class-id");

    if (!classAZlist[classId]) {
      classAZlist[classId] = {};
    }

    c.find("a").each((dex, o) => {
      let specs = $(o).data("specs");
      if (specs) {
        specs = specs.toString().split(" ");
      } else {
        specs = [""];
      }
      let ins = $(o)
        .find("ins")
        .attr("style");
      ins = ins
        .substring(ins.indexOf("(") + 1, ins.indexOf(")"))
        .replace("/small/", "/medium/");

      specs.forEach(item => {
        if (!classAZlist[c.data("class-id")][item]) {
          classAZlist[c.data("class-id")][item] = {};
        }

        classAZlist[c.data("class-id")][item][$(o).data("spell-id")] = {
          name: $(o)
            .find(".name-label")
            .text(),
          icon: ins,
          type: $(o).attr("class"),
          tier: $(o).data("tier")
        };
      });
    });
  });
  return classAZlist;
};

const dealClassAZList = obj => {
  let list = "";
  for (let classId in obj) {
    for (let talent in obj[classId]) {
      for (let az in obj[classId][talent]) {
        list +=
          JSON.stringify({
            _id: `${classId}_${talent}_${az}`,
            name: obj[classId][talent][az].name,
            icon: obj[classId][talent][az].icon,
            classId,
            talent,
            az,
            type: obj[classId][talent][az].type,
            tier: obj[classId][talent][az].tier
          }) + "\n";
      }
    }
  }
  return list;
};

const getAZInfo = id => {
  return axios
    .get(`https://cn.wowhead.com/tooltip/spell/${id}&json&power`)
    .then(res => {
      let $ = cheerio.load(res.data.tooltip);
      return {
        name: res.data.name,
        tips: $(".q").text()
      };
    });
};

const dealClassAZAAZList = async obj => {
  let list = "";
  let index = 0;
  for (let classId in obj) {
    for (let aza in obj[classId]) {
      for (let az in obj[classId][aza]) {
        list +=
          JSON.stringify({
            _id: ++index,
            classId,
            aza,
            az,
            tier: obj[classId][aza][az]
          }) + "\n";
      }
    }
  }
  return list;
};

const dealItem = (AZAObj, itemObj) => {
  let list = "";
  itemObj.data.forEach((item, index) => {
    list +=
      JSON.stringify({
        _id: item.id,
        name: AZAObj[item.id].name_zhcn,
        slotbak: AZAObj[item.id].jsonequip.slotbak,
        sourcemore: item.sourcemore,
        icon:`https://wow.zamimg.com/images/wow/icons/medium/${AZAObj[item.id].icon}.jpg`
      }) + "\n";
  });
  return list;
};

axios.get("https://cn.wowhead.com/azerite-finder").then(res => {
  let $ = cheerio.load(res.data); //cheerio模块开始处理 DOM处理
  let classAZAZAList = getClassAZAAZList($);
  fs.writeFileSync("class-aza-az.json", JSON.stringify(classAZAZAList));

  dealClassAZAAZList(classAZAZAList).then(result => {
    fs.writeFileSync("class-aza-az-line.json", result);
  });

  let AZAObj = getAZAItemList($);
  let itemObj = getItemList($);

  fs.writeFileSync("aza-item.json", JSON.stringify(AZAObj));
  fs.writeFileSync("item.json", JSON.stringify(itemObj));

  fs.writeFileSync("aza-item-line.json", dealItem(AZAObj, itemObj));

  let classAZList = getClassAZList($);

  fs.writeFileSync("class-az.json", JSON.stringify(classAZList));
  fs.writeFileSync("class-az-line.json", dealClassAZList(classAZList));
});
