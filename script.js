WH.Wow.AzeriteFinder = function() {
  var l = {
    wrapper: null,
    checkMulti: null,
    checkTier: null,
    classIconsContainer: null,
    spellContainer: null
  };
  var c;
  var g = null;
  var o = {
    historyVersion: 2,
    classId: null,
    specId: null,
    roleId: null,
    spellIds: [],
    multiSelect: true,
    showTier: false
  };
  var a = {};
  var m = false;
  this.init = function(w, v, s) {
    a = v;
    g = g_listviews[w + "-items"];
    g.customFilter = d;
    var u = g.getItemLink;
    g.getItemLink = function(y) {
      return u(y) + (o.classId ? "&azerite-powers=" + o.classId : "");
    };
    l.wrapper = $("#" + w + "-wrapper");
    l.spellContainer = l.wrapper.find(".azerite-finder-spells");
    l.classIconsContainer = l.wrapper.find(".azerite-finder-class-icons");
    l.checkMulti = $("#" + w + "-option-multi");
    l.checkTier = $("#" + w + "-option-tier");
    c = l.wrapper[0].parentNode.classList.contains(
      "azerite-finder-markup-parent"
    );
    l.classIconsContainer.find("a").each(function() {
      var D = this.parentNode.dataset.classId;
      if (D) {
        WH.Tooltip.simple(this, g_chr_classes[D], "c" + D, true);
        var C = [
          [
            0,
            WH.TERMS.all,
            p.bind(WH.Wow.AzeriteFinder, this.parentNode, D, null, null),
            null,
            { checkedFunc: e.bind(WH.Wow.AzeriteFinder, D, null) }
          ]
        ];
        var z = Menu.findItem(mn_specialization, [D]);
        for (var A = 0, B; (B = z[MENU_IDX_SUB][A]); A++) {
          C.push([
            B[MENU_IDX_ID],
            B[MENU_IDX_NAME],
            p.bind(
              WH.Wow.AzeriteFinder,
              this.parentNode,
              D,
              B[MENU_IDX_ID],
              null
            ),
            null,
            $.extend({}, B[MENU_IDX_OPT], {
              checkedFunc: e.bind(WH.Wow.AzeriteFinder, D, B[MENU_IDX_ID])
            })
          ]);
        }
        Menu.add(this, C);
      }
      var y = this.parentNode.dataset.roleId;
      if (y) {
        WH.Tooltip.simple(this, g_roles[y], "q", true);
        $(this).on(
          "click",
          p.bind(WH.Wow.AzeriteFinder, this.parentNode, null, null, y)
        );
      }
    });
    l.checkMulti[0].checked = o.multiSelect;
    l.checkMulti.on("click", r);
    l.checkTier[0].checked = o.showTier;
    l.checkTier.on("click", j);
    l.spellContainer
      .find("a")
      .on("click", k)
      .each(function() {
        if (this.dataset.tier) {
          this._fixTooltip = h.bind(null, this.dataset.tierName);
        }
      });
    if (s !== null) {
      for (var t in o) {
        if (o.hasOwnProperty(t) && !s.hasOwnProperty(t)) {
          s[t] = o[t];
        }
      }
    }
    b(s || (c ? undefined : history.state));
    l.wrapper.show();
  };
  function h(s, t) {
    return t.replace(/<b class="q0">[^<]*<\/b>/, '<b class="q0">' + s + "</b>");
  }
  function p(v, w, u, s) {
    o.classId = w;
    o.specId = u;
    o.roleId = s;
    l.wrapper.addClass("chosen-class");
    l.classIconsContainer
      .find(".iconmedium-gold-selected")
      .removeClass("iconmedium-gold-selected");
    $(v).addClass("iconmedium-gold-selected");
    o.spellIds = [];
    l.spellContainer.children("div[data-class-id]").hide();
    l.spellContainer.children("div[data-role-id]").hide();
    l.spellContainer.find(".picked").removeClass("picked");
    l.spellContainer.find(".filtered").removeClass("filtered");
    n();
    if (o.classId) {
      var t = l.spellContainer.children('[data-class-id="' + o.classId + '"]');
      if (o.specId) {
        t.children("[data-specs]").hide();
        t.children("[data-specs~=" + o.specId + "]").show();
      } else {
        t.children("[data-specs]").show();
      }
      l.spellContainer.children('[data-class-id="' + o.classId + '"]').show();
    } else {
      l.spellContainer.children('[data-role-id="' + o.roleId + '"]').show();
    }
    g.updateFilters(1);
    g.refreshRows(true);
    f();
  }
  function r() {
    o.multiSelect = this.checked;
    if (!o.multiSelect && o.spellIds.length > 1) {
      i(o.spellIds.splice(0, 1)[0]);
    } else {
      q();
    }
    f();
  }
  function j() {
    o.showTier = this.checked;
    if (o.showTier) {
      l.spellContainer.addClass("show-tier");
    } else {
      l.spellContainer.removeClass("show-tier");
    }
    n();
    f();
  }
  function k(s) {
    if (s.button != 0) {
      return true;
    }
    if ($(this).hasClass("filtered")) {
      return false;
    }
    l.wrapper.addClass("chosen-spell");
    i(this.dataset.spellId);
    f();
    return false;
  }
  function e(t, s) {
    if (o.roleId) {
      return false;
    }
    if (o.classId != t) {
      return false;
    }
    return s == o.specId;
  }
  function d(E) {
    var B = true;
    var t = [];
    if (o.classId) {
      if (!a[o.classId].hasOwnProperty(E.id)) {
        B = false;
      } else {
        t = [o.classId];
      }
    } else {
      for (var z in a) {
        if (!a.hasOwnProperty(z) || !a[z].hasOwnProperty(E.id)) {
          continue;
        }
        t.push(z);
      }
    }
    var w = true;
    for (var z, u = 0; (z = t[u]); u++) {
      var D = {};
      w = true;
      for (var y, A = 0; (y = o.spellIds[A]); A++) {
        if (!a[z][E.id].hasOwnProperty(y)) {
          w = false;
          break;
        }
        var v = a[z][E.id][y];
        if (D[v]) {
          w = false;
          break;
        }
        D[v] = true;
      }
      if (w) {
        break;
      }
    }
    B &= w;
    if (B && o.classId) {
      if (E.specs) {
        var C,
          s = false;
        for (
          x = 0;
          !s && (C = parseInt(g_chr_specs_by_class[o.classId][x]));
          x++
        ) {
          s |= E.specs.indexOf(C) >= 0;
        }
        B &= s;
      } else {
        B &=
          E.classs != 4 ||
          g_classes_allowed_armor[o.classId].indexOf(E.subclass) >= 0;
      }
    }
    if (B && m !== false && o.spellIds.length > 0) {
      m.push(E.id);
    }
    return B;
  }
  function b(v) {
    if (
      !v ||
      !v.hasOwnProperty("historyVersion") ||
      v.historyVersion !== o.historyVersion
    ) {
      return;
    }
    if (!v.classId && !v.roleId) {
      return;
    }
    var t = v.classId
      ? '[data-class-id="' + v.classId + '"]'
      : '[data-role-id="' + v.roleId + '"]';
    var w = l.classIconsContainer.children(t).get(0);
    p(w, v.classId, v.specId, v.roleId);
    if (v.hasOwnProperty("multiSelect") && v.multiSelect != o.multiSelect) {
      l.checkMulti[0].checked = !!v.multiSelect;
      r.call(l.checkMulti[0]);
    }
    if (v.hasOwnProperty("showTier") && v.showTier != o.showTier) {
      l.checkTier[0].checked = !!v.showTier;
      j.call(l.checkTier[0]);
    }
    if (v.hasOwnProperty("spellIds") && v.spellIds.length) {
      var u;
      for (var s = 0; s < v.spellIds.length; s++) {
        u = l.spellContainer
          .children(t)
          .children('[data-spell-id="' + v.spellIds[s] + '"]');
        if (u.length) {
          k.call(u[0], { button: 0 });
        }
      }
    }
  }
  function i(t) {
    var s;
    if ((s = o.spellIds.indexOf(t)) >= 0) {
      o.spellIds.splice(s, 1);
      l.spellContainer
        .find('[data-spell-id="' + t + '"]')
        .removeClass("picked");
    } else {
      if (!o.multiSelect && o.spellIds.length > 0) {
        o.spellIds = [];
        l.spellContainer.find(".picked").removeClass("picked");
      }
      o.spellIds.push(t);
      l.spellContainer.find('[data-spell-id="' + t + '"]').addClass("picked");
    }
    q();
  }
  function n() {
    var s = l.spellContainer.children(
      o.classId
        ? '[data-class-id="' + o.classId + '"]'
        : '[data-role-id="' + o.roleId + '"]'
    );
    var t = s.children();
    t.sort(function(y, v) {
      if (o.showTier) {
        if (y.dataset.tier != v.dataset.tier) {
          return parseInt(v.dataset.tier) - parseInt(y.dataset.tier);
        }
      }
      var u = y.className.indexOf("neutral-power") < 0;
      var w = v.className.indexOf("neutral-power") < 0;
      if (u != w) {
        return u ? -1 : 1;
      }
      var A = $(y)
        .children(".name-label")
        .text();
      var z = $(v)
        .children(".name-label")
        .text();
      return A.localeCompare(z);
    });
    s.append(t);
  }
  function f() {
    if (c) {
      return;
    }
    history.replaceState(o, "", "");
  }
  function q() {
    if (!o.multiSelect || o.spellIds.length == 0) {
      l.spellContainer.find(".filtered").removeClass("filtered");
      g.updateFilters(1);
      return;
    }
    m = [];
    g.updateFilters(1);
    var v = {};
    for (var w, A = 0; (w = o.spellIds[A]); A++) {
      v[w] = true;
    }
    for (var z, t = 0; (z = m[t]); t++) {
      var s = [];
      if (o.classId) {
        if (!a[o.classId].hasOwnProperty(z)) {
          WH.error("Class " + y + " item " + z + " not found");
        } else {
          s = [o.classId];
        }
      } else {
        for (var y in a) {
          if (!a.hasOwnProperty(y) || !a[y].hasOwnProperty(z)) {
            continue;
          }
          s.push(y);
        }
      }
      classLoop: for (var y, u = 0; (y = s[u]); u++) {
        var B = {};
        for (var w, A = 0; (w = o.spellIds[A]); A++) {
          if (!a[y][z].hasOwnProperty(w)) {
            continue classLoop;
          }
          B[a[y][z][w]] = true;
        }
        for (var w in a[y][z]) {
          if (!a[y][z].hasOwnProperty(w)) {
            continue;
          }
          if (B[a[y][z][w]]) {
            continue;
          }
          v[w] = true;
        }
      }
    }
    m = false;
    l.spellContainer.find("[data-spell-id]").addClass("filtered");
    for (w in v) {
      if (!v.hasOwnProperty(w)) {
        continue;
      }
      l.spellContainer
        .find('[data-spell-id="' + w + '"]')
        .removeClass("filtered");
    }
  }
};
while (WH.Wow.AzeriteFinderQueue && WH.Wow.AzeriteFinderQueue.length) {
  new WH.Wow.AzeriteFinder().init.apply(
    null,
    WH.Wow.AzeriteFinderQueue.shift()
  );
}
