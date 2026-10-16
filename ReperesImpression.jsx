/*
 * ReperesImpression.jsx — v1.0.0
 * Adobe Illustrator CC+ (ExtendScript / ES3)
 *
 * FR : Crée des repères (guides) de marge de sécurité, de fond perdu et une
 *      grille de colonnes/rangées sur les plans de travail, dans un calque dédié.
 * EN : Creates safety-margin, bleed and column/row grid guides on artboards,
 *      inside a dedicated layer.
 *
 * FR : Aucun accès réseau, aucune collecte de données. Travaillez sur une copie.
 * EN : No network access, no data collection. Work on a copy of your file.
 *
 * Licence MIT — (c) 2026 Amirouche Amwanes
 * Statut : non testé dans Illustrator / not tested in Illustrator.
 */
#target illustrator

(function () {
    var NOM_CALQUE = "Repères impression"; // FR: nom du calque / EN: layer name
    var MM = 72 / 25.4;                    // FR: points par mm / EN: points per mm

    // FR: Vérifications de base / EN: basic checks
    if (app.documents.length === 0) {
        alert("Aucun document ouvert.\nNo document open.", "Repères impression", true);
        return;
    }
    var doc = app.activeDocument;

    // ---------- Dialogue ScriptUI / ScriptUI dialog ----------
    var dlg = new Window("dialog", "Repères d'impression / Print guides");
    dlg.orientation = "column";
    dlg.alignChildren = "fill";

    function champ(parent, libelle, valeur) {
        var g = parent.add("group");
        var st = g.add("statictext", undefined, libelle);
        st.preferredSize.width = 210;
        var et = g.add("edittext", undefined, valeur);
        et.characters = 7;
        return et;
    }

    var pUnit = dlg.add("panel", undefined, "Unité / Unit");
    pUnit.orientation = "row";
    var rbMm = pUnit.add("radiobutton", undefined, "mm");
    var rbPt = pUnit.add("radiobutton", undefined, "pt");
    rbMm.value = true;

    var pMarges = dlg.add("panel", undefined, "Marges / Margins");
    pMarges.alignChildren = "left";
    var cbSecu = pMarges.add("checkbox", undefined, "Marge de sécurité / Safety margin");
    cbSecu.value = true;
    var etSecu = champ(pMarges, "Valeur (intérieur) / Inset :", "5");
    var cbFond = pMarges.add("checkbox", undefined, "Fond perdu / Bleed");
    cbFond.value = true;
    var etFond = champ(pMarges, "Valeur (extérieur) / Outset :", "3");

    var pGrille = dlg.add("panel", undefined, "Grille (dans la marge) / Grid (inside margin)");
    pGrille.alignChildren = "left";
    var etCol = champ(pGrille, "Colonnes / Columns :", "1");
    var etRang = champ(pGrille, "Rangées / Rows :", "1");
    var etGout = champ(pGrille, "Gouttière / Gutter :", "4");

    var pCible = dlg.add("panel", undefined, "Plans de travail / Artboards");
    pCible.orientation = "row";
    var rbTous = pCible.add("radiobutton", undefined, "Tous / All");
    var rbActif = pCible.add("radiobutton", undefined, "Actif / Active");
    rbTous.value = true;

    var cbRemplacer = dlg.add("checkbox", undefined, "Remplacer les repères existants du calque / Replace existing guides in layer");
    cbRemplacer.value = true;
    dlg.add("statictext", undefined, "Conseil : travaillez sur une copie. / Tip: work on a copy.");

    var gBtn = dlg.add("group");
    gBtn.alignment = "right";
    gBtn.add("button", undefined, "Annuler / Cancel", { name: "cancel" });
    gBtn.add("button", undefined, "OK", { name: "ok" });

    if (dlg.show() !== 1) { return; }

    // ---------- Lecture des valeurs / Read values ----------
    var facteur = rbMm.value ? MM : 1;

    function lireNombre(et, nom, min) {
        var v = parseFloat(String(et.text).replace(",", "."));
        if (isNaN(v) || v < min) {
            throw new Error("Valeur invalide pour « " + nom + " » (min " + min + ").\nInvalid value for \"" + nom + "\".");
        }
        return v;
    }

    var secu, fond, nCol, nRang, gout;
    try {
        secu = cbSecu.value ? lireNombre(etSecu, "Marge de sécurité", 0) * facteur : 0;
        fond = cbFond.value ? lireNombre(etFond, "Fond perdu", 0) * facteur : 0;
        nCol = Math.floor(lireNombre(etCol, "Colonnes", 1));
        nRang = Math.floor(lireNombre(etRang, "Rangées", 1));
        gout = lireNombre(etGout, "Gouttière", 0) * facteur;
    } catch (e) {
        alert(e.message, "Repères impression", true);
        return;
    }
    if (!cbSecu.value && !cbFond.value && nCol < 2 && nRang < 2) {
        alert("Rien à créer : activez une marge ou une grille.\nNothing to create.", "Repères impression", true);
        return;
    }

    // ---------- Calque dédié / Dedicated layer ----------
    var calque = null;
    try { calque = doc.layers.getByName(NOM_CALQUE); } catch (e1) { calque = null; }
    if (calque === null) {
        calque = doc.layers.add();
        calque.name = NOM_CALQUE;
    } else {
        calque.locked = false;
        calque.visible = true;
        if (cbRemplacer.value) {
            for (var k = calque.pageItems.length - 1; k >= 0; k--) {
                var it = calque.pageItems[k];
                if (it.typename === "PathItem" && it.guides) { it.remove(); }
            }
        }
    }

    // FR: rectangle-repère (top, left, w, h) / EN: guide rectangle
    function rectRepere(gauche, haut, droite, bas) {
        var r = calque.pathItems.rectangle(haut, gauche, droite - gauche, haut - bas);
        r.guides = true;
        return r;
    }
    function ligneRepere(x1, y1, x2, y2) {
        var p = calque.pathItems.add();
        p.setEntirePath([[x1, y1], [x2, y2]]);
        p.guides = true;
        return p;
    }

    // ---------- Création / Creation ----------
    var indices = [];
    if (rbTous.value) {
        for (var a = 0; a < doc.artboards.length; a++) { indices.push(a); }
    } else {
        indices.push(doc.artboards.getActiveArtboardIndex());
    }

    var compte = 0, avert = [];
    for (var i = 0; i < indices.length; i++) {
        var ab = doc.artboards[indices[i]];
        var R = ab.artboardRect; // [gauche, haut, droite, bas] — Y vers le haut / Y up
        var L = R[0], T = R[1], Rt = R[2], B = R[3];

        if (fond > 0) { rectRepere(L - fond, T + fond, Rt + fond, B - fond); compte++; }

        var iL = L + secu, iT = T - secu, iR = Rt - secu, iB = B + secu;
        if (iR - iL <= 0 || iT - iB <= 0) {
            avert.push(ab.name + " : marge trop grande / margin too large");
            continue;
        }
        if (secu > 0) { rectRepere(iL, iT, iR, iB); compte++; }

        // FR: colonnes / EN: columns
        if (nCol > 1) {
            var largCol = (iR - iL - gout * (nCol - 1)) / nCol;
            if (largCol <= 0) { avert.push(ab.name + " : gouttière trop grande (colonnes)"); }
            else {
                for (var c = 1; c < nCol; c++) {
                    var x = iL + c * largCol + (c - 1) * gout;
                    ligneRepere(x, iT, x, iB); compte++;
                    if (gout > 0) { ligneRepere(x + gout, iT, x + gout, iB); compte++; }
                }
            }
        }
        // FR: rangées / EN: rows
        if (nRang > 1) {
            var hautRang = (iT - iB - gout * (nRang - 1)) / nRang;
            if (hautRang <= 0) { avert.push(ab.name + " : gouttière trop grande (rangées)"); }
            else {
                for (var r = 1; r < nRang; r++) {
                    var y = iT - r * hautRang - (r - 1) * gout;
                    ligneRepere(iL, y, iR, y); compte++;
                    if (gout > 0) { ligneRepere(iL, y - gout, iR, y - gout); compte++; }
                }
            }
        }
    }

    calque.locked = true;
    var msg = compte + " repère(s) créé(s) dans le calque « " + NOM_CALQUE + " ».\n" +
              compte + " guide(s) created.";
    if (avert.length) { msg += "\n\nAvertissements / Warnings :\n" + avert.join("\n"); }
    alert(msg, "Repères impression");
})();
