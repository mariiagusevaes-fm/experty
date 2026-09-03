/* Experty.es — реферальный код: захват из URL и подстановка в форму */
(function () {
  "use strict";

  function readRef() {
    try {
      var p = new URLSearchParams(location.search);
      return p.get("ref") || p.get("invited_by") || p.get("r") || "";
    } catch (e) {
      return "";
    }
  }

  // Запоминаем код при первом заходе по реферальной ссылке
  var incoming = readRef();
  if (incoming) {
    try { localStorage.setItem("experty_ref", incoming); } catch (e) {}
  }

  // Вызывается при открытии формы — подставляет сохранённый код
  window.expertyFillRef = function () {
    var ref = incoming;
    if (!ref) {
      try { ref = localStorage.getItem("experty_ref") || ""; } catch (e) {}
    }
    if (!ref) return;

    var rc = document.getElementById("ref_code");
    var ib = document.getElementById("invited_by");
    var field = document.getElementById("invited-by-field");

    if (rc && !rc.value) rc.value = ref;
    if (ib && !ib.value) ib.value = ref;
    if (field) field.style.display = "block";
  };
})();
