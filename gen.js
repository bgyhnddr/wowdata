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
  
        specs.forEach(item => {
          if (!classAZlist[c.data("class-id")][item]) {
            classAZlist[c.data("class-id")][item] = {};
          }
  
          classAZlist[c.data("class-id")][item][$(o).data("spell-id")] = $(o)
            .find(".name-label")
            .text();
        });
      });
    });
    return classAZlist;
  };