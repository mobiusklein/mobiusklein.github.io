var GlycReSoftMSMSGlycopeptideResultsViewApp;

GlycReSoftMSMSGlycopeptideResultsViewApp = angular.module("GlycReSoftMSMSGlycopeptideResultsViewApp", ["ui.bootstrap", "ngGrid", "ngSanitize"]);

Array.prototype.sum = function() {
  var i, total, _i, _len;
  total = 0;
  for (_i = 0, _len = this.length; _i < _len; _i++) {
    i = this[_i];
    total += i;
  }
  return total;
};

Array.prototype.mean = function() {
  var total;
  total = this.sum();
  return total / this.length;
};
;
var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

(function() {
  var activateFn, applyFiltrex, filterByFiltrex, filterRules, focusRow, groupingRules, helpText, setGroupBy, updateFiltrexDebounce, watchExternalDataChanges;
  setGroupBy = function(grouping, predictions) {
    var clustered, id;
    clustered = _.groupBy(predictions, grouping);
    id = 0;
    _.forEach(clustered, function(matches, key) {
      var match, _i, _len;
      for (_i = 0, _len = matches.length; _i < _len; _i++) {
        match = matches[_i];
        match['groupBy'] = id;
      }
      return id++;
    });
    return predictions;
  };
  applyFiltrex = function(predictions, filtrexExpr) {
    var filt, filterResults, i, passed, _i, _ref;
    filt = compileExpression(filtrexExpr);
    console.log(filt, filt.js);
    filterResults = _.map(predictions, filt);
    passed = [];
    for (i = _i = 0, _ref = predictions.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
      if (filterResults[i] === 1) {
        passed.push(predictions[i]);
      }
    }
    return passed;
  };
  filterByFiltrex = function($scope, orderBy) {
    var column, ex, expr, filteredPredictions, groupedResults, key, orderedResults, _ref;
    expr = $scope.params.filtrexExpr.toLowerCase();
    _ref = $scope.headerSubstituitionDictionary;
    for (column in _ref) {
      key = _ref[column];
      expr = expr.replace(new RegExp(column, "g"), key);
    }
    try {
      console.log(expr);
      filteredPredictions = applyFiltrex($scope._predictions, expr);
      if (filteredPredictions.length === 0 && $scope._predictions.length === !0) {
        throw new Error("Incomplete Expression");
      }
      orderedResults = orderBy(filteredPredictions, ["MS1_Score", "Obs_Mass", "MS2_Score"]);
      groupedResults = $scope.groupByKey != null ? setGroupBy($scope.groupByKey, orderedResults) : orderedResults;
      $scope.predictions = groupedResults;
      $scope.filtrexError = false;
      return groupedResults;
    } catch (_error) {
      ex = _error;
      console.log("in catch");
      console.log(ex, $scope.filtrexError);
      if (expr.length > 0) {
        $scope.filtrexError = true;
      }
      if (expr.length === 0) {
        return $scope.predictions = $scope._predictions;
      }
    }
  };
  updateFiltrexDebounce = _.debounce(function($scope, orderBy) {
    return $scope.$apply(function() {
      return filterByFiltrex($scope, orderBy);
    });
  });
  10000;
  watchExternalDataChanges = function($scope, $window, orderBy) {
    return $scope.$watch("_predictionsReceiver", function(newVal, oldVald) {
      var filteredPredictions, groupedPredictions;
      console.log(arguments);
      $scope._predictions = orderBy(newVal, ["MS1_Score", "Obs_Mass", "-MS2_Score"]);
      filteredPredictions = filterByFiltrex($scope, orderBy);
      if (filteredPredictions == null) {
        filteredPredictions = $scope._predictions;
      }
      groupedPredictions = $scope.setGroupBy($scope.params.currentGroupingRule.groupByKey, filteredPredictions);
      $scope.predictions = groupedPredictions;
      return true;
    }, false);
  };
  focusRow = function($scope, targetRowIndex) {
    var grid, position;
    grid = $scope.gridOptions.ngGrid;
    position = grid.rowMap[targetRowIndex] * grid.config.rowHeight;
    console.log(grid.$viewport);
    grid.$viewport.scrollTop(position);
    return console.log(grid.$viewport);
  };
  activateFn = function($scope, $window, $filter) {
    var orderBy;
    orderBy = $filter("orderBy");
    $scope.deregisterWatcher = watchExternalDataChanges($scope, $window, orderBy);
    $scope.$watch("params.filtrexExpr", function() {
      return updateFiltrexDebounce($scope, orderBy);
    });
    $scope.$on("selectedPredictions", function(evt, params) {
      var glycopeptide, index, _i, _len, _ref, _results;
      try {
        $scope.gridOptions.selectAll(false);
        _ref = params.selectedPredictions;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          glycopeptide = _ref[_i];
          index = _.findIndex($scope.predictions, {
            "Glycopeptide_identifier": glycopeptide.Glycopeptide_identifier
          });
          _results.push($scope.gridOptions.selectRow(index, true));
        }
        return _results;
      } catch (_error) {}
    });
    $scope.$on("ambiguityPlot.requestPredictionsUpdate", function(evt, params) {
      return $scope.sendRenderPlotEvt();
    });
    $scope.headerSubstituitionDictionary = $scope.buildHeaderSubstituitionDictionary();
    return console.log("Activation Complete");
  };
  helpText = {
    filtrex: '<article class="help-article"><h3>Filtrex</h3><h4>Expressions</h4><p>There are only 2 types: numbers and strings.</p><table><tbody><table class="table"><thead><tr><th>Numeric arithmetic</th><th>Description</th></tr></thead><tbody><tr><td>x + y</td><td>Add</td></tr><tr><td>x - y</td><td>Subtract</td></tr><tr><td>x * y</td><td>Multiply</td></tr><tr><td>x / y</td><td>Divide</td></tr><tr><td>x % y</td><td>Modulo</td></tr><tr><td>x ^ y</td><td>Power</td></tr></tbody></table><table class="table"><thead><tr><th>Comparisons</th><th>Description</th></tr></thead><tbody><tr><td>x == y</td><td>Equals</td></tr><tr><td>x &lt; y</td><td>Less than</td></tr><tr><td>x &lt;= y</td><td>Less than or equal to</td></tr><tr><td>x &gt; y</td><td>Greater than</td></tr><tr><td>x &gt;= y</td><td>Greater than or equal to</td></tr><tr><td>x in (a, b, c)</td><td>Equivalent to (x == a or x == b or x == c)</td></tr><tr><td>x not in (a, b, c)</td><td>Equivalent to (x != a and x != b and x != c)</td></tr></tbody></table><table class="table"><thead><tr><th>Boolean logic</th><th>Description</th></tr></thead><tbody><tr><td>x or y</td><td>Boolean or</td></tr><tr><td>x and y</td><td>Boolean and</td></tr><tr><td>not x</td><td>Boolean not</td></tr><tr><td>x ? y : z</td><td>If boolean x, value y, else z</td></tr></tbody></table><p>Created by Joe Walnes, <a href="https://github.com/joewalnes/filtrex"><br/>(See https://github.com/joewalnes/filtrex for more usage information.)</a></p></article>'
  };
  filterRules = {
    requirePeptideBackboneCoverage: {
      label: "Require Peptide Backbone Fragment Ions Matches",
      filtrex: "Mean Peptide Coverage > 0"
    },
    requireStubIons: {
      label: "Require Stub Ions Matches",
      filtrex: "Stub Ion Count > 0"
    },
    requireIonsWithHexNAc: {
      label: "Require Peptide Backbone Ion Fragmentss with HexNAc Matches",
      filtrex: "(% Y Ion With HexNAc Coverage + % B Ion With HexNAc Coverage) > 0"
    }
  };
  groupingRules = {
    ms1ScoreObsMass: {
      label: "Group ion matches by MS1 Score and Observed Mass (Ambiguous Matches)",
      groupByKey: function(x) {
        return [x.MS1_Score, x.Obs_Mass];
      }
    },
    startAALength: {
      label: "Group ion matches by the starting amino acid index and the peptide length (Heterogeneity)",
      groupByKey: function(x) {
        return [x.startAA, x.peptideLens];
      }
    }
  };
  return angular.module("GlycReSoftMSMSGlycopeptideResultsViewApp").controller("ClassifierResultsTableCtrl", [
    "$scope", "$window", '$filter', 'csvService', function($scope, $window, $filter, csvService) {
      var orderBy;
      orderBy = $filter("orderBy");
      $scope.helpText = helpText;
      $scope.filterRules = filterRules;
      $scope.groupingRules = groupingRules;
      $scope.predictions = [];
      $scope._predictions = [];
      $scope._predictionsReceiver = [];
      $scope.params = {};
      $scope.headerSubstituitionDictionary = {};
      $scope.params.filtrexExpr = "MS2 Score > 0.2";
      $scope.params.currentGroupingRule = $scope.groupingRules.ms1ScoreObsMass;
      $scope.groupByKey = null;
      $scope.deregisterWatcher = null;
      $scope.ping = function(args) {
        return console.log("ping", arguments, $scope);
      };
      $scope.extendFiltrex = function(expr) {
        console.log("Extending Filtrex with " + expr);
        if ($scope.params.filtrexExpr.length > 0) {
          return $scope.params.filtrexExpr += " and " + expr;
        } else {
          return $scope.params.filtrexExpr += expr;
        }
      };
      $scope.filterByFiltrex = function() {
        var column, dictionary, expr, groupedResults, key, orderedResults, results;
        dictionary = $scope.substituteHeaders();
        expr = $scope.params.filtrexExpr.toLowerCase();
        for (column in dictionary) {
          key = dictionary[column];
          expr = expr.replace(column, key);
        }
        console.log(expr);
        results = applyFiltrex($scope._predictions, expr);
        orderedResults = orderBy(results, ["MS1_Score", "Obs_Mass", "MS2_Score"]);
        groupedResults = setGroupBy($scope.groupByKey, orderedResults);
        return groupedResults;
      };
      $scope.sendRenderPlotEvt = function() {
        return $scope.$broadcast("ambiguityPlot.renderPlot", {
          predictions: $scope.predictions
        });
      };
      $scope.sendUpdateProteinViewEvt = function() {
        return $scope.$broadcast("proteinSequenceView.updateProteinView", {
          predictions: $scope.predictions
        });
      };
      $scope.setGroupBy = function(grouping, predictions) {
        if (predictions == null) {
          predictions = null;
        }
        $scope.groupByKey = grouping;
        return setGroupBy(grouping, predictions);
      };
      $scope.scrollToSelection = function() {
        var glycopeptide, index, selectedItems, topIndex, _i, _len;
        if (($scope.gridOptions.$gridScope != null) && ($scope.gridOptions.$gridScope.selectedItems != null)) {
          selectedItems = $scope.gridOptions.$gridScope.selectedItems;
          topIndex = Infinity;
          for (_i = 0, _len = selectedItems.length; _i < _len; _i++) {
            glycopeptide = selectedItems[_i];
            index = _.findIndex($scope.predictions, {
              "Glycopeptide_identifier": glycopeptide.Glycopeptide_identifier
            });
            if (index < topIndex) {
              topIndex = index;
            }
          }
          if (topIndex === Infinity) {
            return false;
          }
          return focusRow($scope, topIndex);
        }
      };
      $scope.buildHeaderSubstituitionDictionary = function() {
        var BLACK_LIST, column, dictionary, _i, _len, _ref, _ref1;
        dictionary = {};
        dictionary.NAME_MAP = [];
        BLACK_LIST = ["Peptide Span"];
        _ref = $scope.gridOptions.columnDefs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          column = _ref[_i];
          if (!(_ref1 = column.displayName, __indexOf.call(BLACK_LIST, _ref1) >= 0)) {
            dictionary.NAME_MAP.push(column.displayName);
            dictionary[column.displayName.toLowerCase()] = column.field;
          }
        }
        dictionary["Start AA".toLowerCase()] = "startAA";
        dictionary.NAME_MAP.push("Start AA");
        dictionary["End AA".toLowerCase()] = "endAA";
        dictionary.NAME_MAP.push("End AA");
        dictionary["AA Length".toLowerCase()] = "peptideLens";
        dictionary.NAME_MAP.push("AA Length");
        dictionary["Oxonium Ion Count".toLowerCase()] = "numOxIons";
        dictionary.NAME_MAP.push("Oxonium Ion Count");
        dictionary["Stub Ion Count".toLowerCase()] = "numStubs";
        dictionary.NAME_MAP.push("Stub Ion Count");
        dictionary["% Y Ion Coverage".toLowerCase()] = "percent_y_ion_coverage";
        dictionary.NAME_MAP.push("% Y Ion Coverage");
        dictionary["% B Ion Coverage".toLowerCase()] = "percent_b_ion_coverage";
        dictionary.NAME_MAP.push("% B Ion Coverage");
        dictionary["% Y Ion With HexNAc Coverage".toLowerCase()] = "percent_y_ion_with_HexNAc_coverage";
        dictionary.NAME_MAP.push("% Y Ion With HexNAc Coverage");
        dictionary["% B Ion With HexNAc Coverage".toLowerCase()] = "percent_b_ion_with_HexNAc_coverage";
        dictionary.NAME_MAP.push("% B Ion With HexNAc Coverage");
        return dictionary;
      };
      $scope.gridOptions = {
        data: "predictions",
        showColumnMenu: true,
        showFilter: false,
        enableSorting: false,
        enableHighlighting: true,
        enablePinning: true,
        rowHeight: 90,
        columnDefs: [
          {
            field: 'MS2_Score',
            width: 90,
            pinned: true,
            displayName: "MS2 Score",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)|number:4}}</div></div>'
          }, {
            field: 'MS1_Score',
            width: 90,
            pinned: true,
            displayName: "MS1 Score",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)|number:4}}</div></div>'
          }, {
            field: 'Obs_Mass',
            width: 130,
            pinned: true,
            displayName: "Observed Mass",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)|number:4}}</div></div>'
          }, {
            field: 'vol',
            width: 100,
            pinned: true,
            displayName: "Volume",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)|number:4}}</div></div>'
          }, {
            field: 'ppm_error',
            width: 90,
            displayName: "PPM Error",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)|scientificNotation|number:4}}</div></div>'
          }, {
            field: 'Glycopeptide_identifier',
            width: 240,
            displayName: "Glycopeptide Sequence",
            cellClass: "matched-ions-cell glycopeptide-identifier",
            cellTemplate: '<div><div class="ngCellText" ng-bind-html="row.getProperty(col.field)|highlightModifications"></div></div>'
          }, {
            field: 'meanCoverage',
            width: 180,
            displayName: "Mean Peptide Coverage",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)|number:4}}</div></div>'
          }, {
            field: 'percentUncovered',
            width: 165,
            displayName: "% Peptide Uncovered",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field) * 100|number:2}}</div></div>'
          }, {
            field: "startAA",
            width: 180,
            displayName: "Peptide Span",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)}}-{{row.entity.endAA}}&nbsp;({{row.entity.peptideLens}})</div></div>'
          }, {
            field: 'Oxonium_ions',
            width: 200,
            headerClass: null,
            displayName: "Oxonium Ions",
            cellClass: "stacked-ions-cell-grid",
            cellTemplate: '<div> <div class="ngCellText"> <div class="coverage-text">{{row.entity.numOxIons}} Ions Matched</div> <fragment-ion ng-repeat="fragment_ion in row.getProperty(col.field)"></fragment-ion> </div> </div>'
          }, {
            field: 'Stub_ions',
            width: 340,
            displayName: "Stub Ions",
            headerClass: null,
            cellClass: "stacked-ions-cell-grid",
            cellTemplate: '<div> <div class="ngCellText"> <div class="coverage-text">{{row.entity.numStubs}} Ions Matched</div> <fragment-ion ng-repeat="fragment_ion in row.getProperty(col.field)"></fragment-ion> </div> </div>'
          }, {
            field: 'b_ion_coverage',
            width: 340,
            displayName: "B Ions",
            headerClass: null,
            cellClass: "stacked-ions-cell-grid",
            cellTemplate: '<div> <div class="ngCellText"> <div class="coverage-text">{{row.entity.percent_b_ion_coverage * 100|number:1}}% Coverage</div> <fragment-ion ng-repeat="fragment_ion in row.getProperty(col.field)"></fragment-ion> </div> </div>'
          }, {
            field: 'y_ion_coverage',
            width: 340,
            displayName: "Y Ions",
            headerClass: null,
            cellClass: "stacked-ions-cell-grid",
            cellTemplate: '<div> <div class="ngCellText"> <div class="coverage-text">{{row.entity.percent_y_ion_coverage * 100|number:1}}% Coverage</div> <fragment-ion ng-repeat="fragment_ion in row.getProperty(col.field)"></fragment-ion> </div> </div>'
          }, {
            field: 'b_ions_with_HexNAc',
            width: 340,
            displayName: "B Ions with HexNAc",
            headerClass: null,
            cellClass: "stacked-ions-cell-grid",
            cellTemplate: '<div> <div class="ngCellText"> <div class="coverage-text">{{row.entity.percent_b_ion_with_HexNAc_coverage * 100 |number:1}}% Coverage</div> <fragment-ion ng-repeat="fragment_ion in row.getProperty(col.field)"></fragment-ion> </div> </div>'
          }, {
            field: 'y_ions_with_HexNAc',
            width: 340,
            displayName: "Y Ions with HexNAc",
            headerClass: null,
            cellClass: "stacked-ions-cell-grid",
            cellTemplate: '<div> <div class="ngCellText"> <div class="coverage-text">{{row.entity.percent_y_ion_with_HexNAc_coverage * 100|number:1}}% Coverage</div> <fragment-ion ng-repeat="fragment_ion in row.getProperty(col.field)"></fragment-ion> </div> </div>'
          }
        ],
        rowTemplate: '<div style="height: 100%" class="c{{row.entity.groupBy % 6}}"> <div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell matched-ions-cell"> <div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }"> </div> <div ng-cell> </div> </div> </div>'
      };
      activateFn($scope, $window, $filter);
      return $window.ClassifierResultsTableCtrlInstance = $scope;
    }
  ]);
})();
;
var ModalInstanceCtrl;

ModalInstanceCtrl = function($scope, $modalInstance, title, items, summary, postLoadFn) {
  $scope.title = title;
  $scope.items = items;
  $scope.summary = summary;
  $scope.postLoadFn = postLoadFn;
  $scope.ok = function() {
    console.log($scope);
    return $modalInstance.close(true);
  };
  return $scope.cancel = function() {
    return $modalInstance.dismiss("cancel");
  };
};
;
GlycReSoftMSMSGlycopeptideResultsViewApp.service("csvService", [
  "$window", function($window) {
    this.serializedFields = ["Oxonium_ions", "Stub_ions", "bare_b_ions", "bare_y_ions", "b_ion_coverage", "y_ion_coverage", "b_ions_with_HexNAc", "y_ions_with_HexNAc", "startAA", "endAA", "vol", "numOxIons", "numStubs", "bestCoverage", "meanCoverage", "percentUncovered", "peptideLens", "MS1_Score", "MS2_Score", "Obs_Mass", "Calc_mass", 'ppm_error', 'abs_ppm_error'];
    this.parse = function(stringData) {
      var instantiatedData, rowData;
      rowData = d3.csv.parse(stringData);
      instantiatedData = this.deserializeAfterParse(rowData);
      return instantiatedData;
    };
    this.format = function(rowData) {
      var serializedData, stringData;
      serializedData = this.serializeBeforeFormat(rowData);
      stringData = d3.csv.format(serializedData);
      return stringData;
    };
    this.deserializeAfterParse = function(predictions) {
      var self;
      self = this;
      _.forEach(predictions, function(obj) {
        _.forEach(self.serializedFields, function(field) {
          return obj[field] = angular.fromJson(obj[field]);
        });
        obj.call = obj.call === "Yes" ? true : false;
        obj.ambiguity = obj.ambiguity === "True" ? true : false;
        obj.groupBy = 0;
        return obj;
      });
      return predictions;
    };
    this.serializeBeforeFormat = function(predictions) {
      var self;
      self = this;
      predictions = _.cloneDeep(predictions);
      _.forEach(predictions, function(obj) {
        _.forEach(self.serializedFields, function(field) {
          return obj[field] = angular.toJson(obj[field]);
        });
        obj.call = obj.call ? "Yes" : "No";
        obj.ambiguity = obj.ambiguity ? "True" : "False";
        obj.groupBy = 0;
        return obj;
      });
      return predictions;
    };
    console.log(this);
    return $window.csvService = this;
  }
]);
;
angular.module("GlycReSoftMSMSGlycopeptideResultsViewApp").service("colorService", [
  function() {
    this.colors = ["blue", "rgb(228, 211, 84)", "red", "purple", "grey", "black", "green", "orange", "brown"];
    this._colorIter = 0;
    this.colorMap = {
      Peptide: "seagreen",
      HexNAc: "#CC99FF"
    };
    this._nextColor = function() {
      var color;
      color = this.colors[this._colorIter++];
      if (this._colorIter >= this.colors.length) {
        this._colorIter = 0;
      }
      return color;
    };
    this.getColor = function(label) {
      if (!(label in this.colorMap)) {
        this.colorMap[label] = this._nextColor();
      }
      return this.colorMap[label];
    };
    return console.log(this);
  }
]);
;
var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

angular.module("GlycReSoftMSMSGlycopeptideResultsViewApp").directive("proteinSequenceView", [
  "$window", "$filter", "colorService", "$modal", "$timeout", function($window, $filter, colorService, $modal, $timeout) {
    var featureTemplate, fragmentsContainingModification, fragmentsSurroundingPosition, generateConfig, getBestScoresForModification, heightLayerMap, highlightModifications, legendKeyTemplate, makeGlycanCompositionContent, orderBy, parseGlycopeptideIdentifierToModificationsArray, shapeMap, shapes, transformFeatuersToLegend, transformPredictionGroupsToFeatures, typeCategoryMap, updateView, _layerCounter, _layerIncrement, _shapeIter;
    $window.modal = $modal;
    orderBy = $filter("orderBy");
    $window.orderBy = orderBy;
    highlightModifications = $filter("highlightModifications");
    _shapeIter = 0;
    shapes = ["diamond", "triangle", "hexagon", "wave", "circle"];
    featureTemplate = {
      nonOverlappingStyle: {
        heightOrRadius: 10,
        y: 140
      },
      centeredStyle: {
        heightOrRadius: 48,
        y: 71
      },
      rowStyle: {
        heightOrRadius: 10,
        y: 181
      },
      text: "",
      type: "rect",
      fill: "#CDBCF6",
      stroke: "#CDBCF6",
      fillOpacity: 0.5,
      height: 10,
      evidenceText: ":",
      evidenceCode: "MS2 Score",
      typeCategory: "typeCategory",
      typeCode: "typeCode",
      path: "",
      typeLabel: "",
      featureLabel: "",
      featureStart: null,
      featureEnd: null,
      strokeWidth: 1,
      r: 10,
      featureTypeLabel: ""
    };
    legendKeyTemplate = {
      label: {
        total: 1,
        yPosCentered: 210,
        text: "Domain",
        yPos: 234,
        xPos: 50,
        yPosNonOverlapping: 234,
        yPosRows: 310
      },
      shape: {
        centeredStyle: {
          heightOrRadius: 5,
          y: 208
        },
        text: "",
        nonOverlappingStyle: {
          heightOrRadius: 5,
          y: 229
        },
        width: 30,
        fill: "#033158",
        cy: 229,
        cx: 15,
        type: "rect",
        fillOpacity: 0.5,
        stroke: "#033158",
        height: 5,
        r: 10,
        path: "",
        rowsStyle: {
          heightOrRadius: 5,
          y: 305
        },
        typeLabel: "",
        y: 229,
        strokeWidth: 1,
        x: 15
      }
    };
    shapeMap = {
      Peptide: "rect",
      HexNAc: "circle",
      PTM: "triangle"
    };
    typeCategoryMap = {
      "HexNAc": "Glycan"
    };
    _layerCounter = 0;
    _layerIncrement = 15;
    heightLayerMap = {};
    generateConfig = function($window) {
      var configuration;
      configuration = {
        aboveRuler: 10,
        belowRuler: 30,
        requestedStop: 770,
        horizontalGridNumLines: 11,
        sequenceLineYCentered: 95,
        requestedStart: 1,
        gridLineHeight: 12,
        rightMargin: 20,
        sequenceLength: 770,
        horizontalGridNumLinesNonOverlapping: 11,
        horizontalGridNumLinesCentered: 6,
        verticalGridLineLengthRows: 284,
        unitSize: 0.8571428571428571,
        sizeYNonOverlapping: 184,
        style: "nonOverlapping",
        sequenceLineYRows: 155,
        sequenceLineY: 138,
        verticalGrid: false,
        rulerY: 20,
        dasSources: null,
        horizontalGrid: false,
        pixelsDivision: 50,
        sizeY: $window.innerHeight * 3.0,
        sizeX: $window.innerWidth * .95,
        dasReference: null,
        sizeYRows: 260,
        rulerLength: $window.innerWidth * .8,
        verticalGridLineLengthNonOverlapping: 174,
        sizeYKey: 210,
        sizeYCentered: 160,
        sequenceLineYNonOverlapping: 138,
        verticalGridLineLength: 174,
        horizontalGridNumLinesRows: 8,
        leftMargin: 20,
        nonOverlapping: true,
        verticalGridLineLengthCentered: 172
      };
      return configuration;
    };
    transformFeatuersToLegend = function(featuresArray) {
      return [];
    };
    getBestScoresForModification = function(modifications, features) {
      var bestMod, colocatingFeatures, containingFragments, foldedMods, frequencyOfModification, mod, modId, ordMods, topMods, _ref;
      foldedMods = _.groupBy(modifications, "featureId");
      topMods = [];
      for (modId in foldedMods) {
        mod = foldedMods[modId];
        ordMods = orderBy(mod, (function(obj) {
          return obj._obj.MS2_Score;
        }), true);
        bestMod = ordMods[0];
        colocatingFeatures = fragmentsSurroundingPosition(bestMod.featureStart, features);
        _ref = fragmentsContainingModification(bestMod, colocatingFeatures), frequencyOfModification = _ref[0], containingFragments = _ref[1];
        bestMod.statistics = {
          meanScore: _.pluck(ordMods, (function(obj) {
            return obj._obj.MS2_Score;
          })).mean(),
          frequency: frequencyOfModification
        };
        bestMod.additionalTooltipContent = "<br/>Mean Score: " + (bestMod.statistics.meanScore.toFixed(3)) + " <br/>Frequency of Feature: " + ((bestMod.statistics.frequency * 100).toFixed(2)) + "%";
        if (typeCategoryMap[bestMod.featureTypeLabel] === "Glycan") {
          makeGlycanCompositionContent(bestMod, containingFragments);
        }
        topMods.push(bestMod);
      }
      return topMods;
    };
    fragmentsSurroundingPosition = function(position, fragments) {
      var end, fragRanges, range, results, start, _ref;
      fragRanges = _.groupBy(fragments, (function(frag) {
        return [frag.featureStart, frag.featureEnd];
      }));
      results = [];
      for (range in fragRanges) {
        fragments = fragRanges[range];
        _ref = range.split(','), start = _ref[0], end = _ref[1];
        if (position >= start && position <= end) {
          results = results.concat(fragments);
        }
      }
      return results;
    };
    fragmentsContainingModification = function(modification, fragments) {
      var containingFragments, count, frag, _i, _len, _ref;
      count = 0;
      containingFragments = [];
      for (_i = 0, _len = fragments.length; _i < _len; _i++) {
        frag = fragments[_i];
        if (_ref = modification.featureId, __indexOf.call(frag.modifications, _ref) >= 0) {
          count++;
          containingFragments.push(frag);
        }
      }
      return [count / fragments.length, containingFragments];
    };
    makeGlycanCompositionContent = function(bestMod, containingFragments) {
      var composition, frag, frequency, glycanCompositionContent, glycanMap, _i, _len;
      bestMod.hasModalContent = true;
      glycanMap = {};
      for (_i = 0, _len = containingFragments.length; _i < _len; _i++) {
        frag = containingFragments[_i];
        if (!(frag._obj.Glycan in glycanMap)) {
          glycanMap[frag._obj.Glycan] = 0;
        }
        glycanMap[frag._obj.Glycan]++;
      }
      bestMod.statistics.glycanMap = {};
      bestMod.additionalTooltipContent += "</br><b>Click to see Glycan Composition distribution</b>";
      glycanCompositionContent = "<div class='frequency-plot-container'></div> <table class='table table-striped table-compact centered glycan-composition-frequency-table'> <tr> <th>Glycan Composition</th><th>Frequency(%)</th> </tr>";
      for (composition in glycanMap) {
        frequency = glycanMap[composition];
        frequency = frequency / containingFragments.length;
        bestMod.statistics.glycanMap[composition] = frequency;
        glycanCompositionContent += "<tr> <td>" + composition + "</td><td>" + ((frequency * 100).toFixed(2)) + "</td> </tr>";
      }
      glycanCompositionContent += "</table>";
      return bestMod.modalOptions = {
        title: "Glycan Composition: " + bestMod.featureId,
        summary: glycanCompositionContent,
        items: [],
        postLoadFn: function() {
          angular.element('.frequency-plot-container').highcharts({
            data: {
              table: angular.element('.glycan-composition-frequency-table')[0]
            },
            chart: {
              type: 'column'
            },
            title: {
              text: 'Glycan Composition Frequency'
            },
            yAxis: {
              allowDecimals: false,
              title: {
                text: 'Frequency (%)'
              }
            },
            xAxis: {
              type: 'category',
              labels: {
                rotation: -45
              }
            },
            tooltip: {
              pointFormat: '<b>{point.y}%</b> Frequency'
            },
            legend: {
              enabled: false
            }
          });
          console.log(window.TESTX, "charted");
          return console.log($('.frequency-plot-container'));
        }
      };
    };
    parseGlycopeptideIdentifierToModificationsArray = function(glycoform, startSite) {
      var feature, frag, fragments, glycopeptide, index, label, modifications, regex, _i, _len;
      glycopeptide = glycoform.Glycopeptide_identifier;
      regex = /(\(.+?\)|\[.+?\])/;
      index = 0;
      fragments = glycopeptide.split(regex);
      modifications = [];
      for (_i = 0, _len = fragments.length; _i < _len; _i++) {
        frag = fragments[_i];
        if (frag.charAt(0) === "[") {

        } else if (frag.charAt(0) === "(") {
          label = frag.replace(/\(|\)/g, "");
          feature = _.cloneDeep(featureTemplate);
          feature.type = label in shapeMap ? shapeMap[label] : shapeMap.PTM;
          if (feature.type === "circle") {
            feature.r /= 2;
          }
          feature.fill = colorService.getColor(label);
          feature.featureStart = index + startSite;
          feature.featureEnd = index + startSite;
          feature.typeLabel = "";
          feature.typeCode = "";
          feature.typeCategory = "";
          feature.evidenceText = glycoform.MS2_Score;
          feature.featureLabel = label;
          feature.featureTypeLabel = label;
          feature.featureId = label + "-" + (index + startSite);
          if (!(label in heightLayerMap)) {
            _layerCounter += _layerIncrement;
            heightLayerMap[label] = _layerCounter;
          }
          feature.cy = 140 - (feature.r + heightLayerMap[label]);
          feature._obj = glycoform;
          modifications.push(feature);
        } else {
          index += frag.length;
        }
      }
      return modifications;
    };
    transformPredictionGroupsToFeatures = function(predictions) {
      var arrange, depth, feature, featuresArray, foldedMods, frag, fragRange, fragments, glycoform, glycoformModifications, modifications, topMods, _i, _j, _len, _len1;
      fragments = _.groupBy(predictions, function(p) {
        return [p.startAA, p.endAA];
      });
      featuresArray = [];
      modifications = [];
      arrange = orderBy(Object.keys(fragments, function(range) {
        var end, start, _ref;
        _ref = range.split(","), start = _ref[0], end = _ref[1];
        return end - start;
      })).reverse();
      for (_i = 0, _len = arrange.length; _i < _len; _i++) {
        fragRange = arrange[_i];
        frag = fragments[fragRange];
        depth = 1;
        frag = orderBy(frag, "MS2_Score").reverse();
        for (_j = 0, _len1 = frag.length; _j < _len1; _j++) {
          glycoform = frag[_j];
          feature = _.cloneDeep(featureTemplate);
          feature.type = shapeMap.Peptide;
          feature.fill = colorService.getColor("Peptide");
          feature.stroke = colorService.getColor("Peptide");
          feature.featureStart = glycoform.startAA;
          feature.featureEnd = glycoform.endAA;
          feature.text = glycoform.Glycopeptide_identifier;
          feature.typeLabel = "Peptide";
          feature.typeCode = "";
          feature.typeCategory = "";
          feature.featureTypeLabel = "glycopeptide_match";
          feature.evidenceText = glycoform.MS2_Score;
          feature.featureId = glycoform.Glycopeptide_identifier.replace(/\[|\]|;|\(|\)/g, "-");
          feature.y = depth * (feature.height + 2 * feature.strokeWidth) + 125;
          glycoformModifications = parseGlycopeptideIdentifierToModificationsArray(glycoform, glycoform.startAA);
          modifications = modifications.concat(glycoformModifications);
          feature.modifications = _.pluck(glycoformModifications, "featureId");
          feature._obj = glycoform;
          feature.featureLabel = highlightModifications(glycoform.Glycopeptide_identifier, false);
          featuresArray.push(feature);
          depth++;
        }
      }
      foldedMods = _.pluck(_.groupBy(modifications, "featureId"), function(obj) {
        return obj[0];
      });
      topMods = getBestScoresForModification(modifications, featuresArray);
      featuresArray = featuresArray.concat(topMods);
      return featuresArray;
    };
    updateView = function(scope, element) {
      var biojsId, conf;
      scope.start = Math.min.apply(null, _.pluck(scope.predictions, "startAA"));
      scope.end = Math.max.apply(null, _.pluck(scope.predictions, "endAA"));
      scope.featureViewerConfig.featuresArray = transformPredictionGroupsToFeatures(scope.predictions);
      scope.featureViewerConfig.legend.keys = [];
      conf = scope.featureViewerConfig.configuration = generateConfig($window);
      conf.requestedStart = scope.start;
      conf.requestedStop = scope.end;
      conf.sequenceLength = scope.end;
      if (scope.featureViewerInstance != null) {
        try {
          scope.featureViewerInstance.clear();
          biojsId = scope.featureViewerInstance;
          delete Biojs_FeatureViewer_array[biojsId - 1];
          delete scope.featureViewerInstance;
        } catch (_error) {}
      }
      scope.featureViewerInstance = new Biojs.FeatureViewer({
        target: "protein-sequence-view-container-div",
        json: _.cloneDeep(scope.featureViewerConfig)
      });
      scope.featureViewerInstance.onFeatureClick(function(featureShape) {
        var feature, id;
        id = featureShape.featureId;
        feature = _.find(scope.featureViewerConfig.featuresArray, {
          featureId: id
        });
        console.log(id, feature);
        if (feature.hasModalContent) {
          window.modalInstance = $modal.open({
            templateUrl: "myModalContent.html",
            scope: scope,
            controller: ModalInstanceCtrl,
            size: 'lg',
            resolve: {
              title: function() {
                return feature.modalOptions.title;
              },
              items: function() {
                return feature.modalOptions.items;
              },
              summary: function() {
                return feature.modalOptions.summary;
              },
              postLoadFn: function() {
                return feature.modalOptions.postLoadFn;
              }
            }
          });
          modalInstance.opened.then(function(evt) {
            return $timeout(feature.modalOptions.postLoadFn, 1000);
          });
        }
        if (feature.featureTypeLabel === "glycopeptide_match") {
          return scope.$emit("selectedPredictions", {
            selectedPredictions: [feature._obj]
          });
        }
      });
      scope.featureViewerInstance.onFeatureOn(function(featureShape) {
        var feature, id, mod, modId, _i, _len, _ref, _results;
        id = featureShape.featureId;
        feature = _.find(scope.featureViewerConfig.featuresArray, {
          featureId: id
        });
        if (feature.modifications != null) {
          _ref = feature.modifications;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            mod = _ref[_i];
            modId = "uniprotFeaturePainter_" + mod;
            _results.push(scope.featureViewerInstance.raphael.getById(modId).transform("s2").attr("fill-opacity", 1));
          }
          return _results;
        }
      });
      scope.featureViewerInstance.onFeatureOff(function(featureShape) {
        var feature, id, mod, modId, _i, _len, _ref, _results;
        id = featureShape.featureId;
        feature = _.find(scope.featureViewerConfig.featuresArray, {
          featureId: id
        });
        if (feature.modifications != null) {
          _ref = feature.modifications;
          _results = [];
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            mod = _ref[_i];
            modId = "uniprotFeaturePainter_" + mod;
            _results.push(scope.featureViewerInstance.raphael.getById(modId).transform("s1").attr("fill-opacity", 0.5));
          }
          return _results;
        }
      });
      return angular.element("#protein-sequence-view-container-div").css({
        height: $window.innerHeight,
        "overflow-y": "scroll"
      });
    };
    return {
      restrict: "E",
      link: function(scope, element, attrs) {
        scope.getColorMap = function() {
          return colorMap;
        };
        scope.featureViewerConfig = {
          featuresArray: [],
          segment: "",
          configuration: {},
          legend: {
            segment: {
              yPosCentered: 190,
              text: "",
              yPos: 234,
              xPos: 15,
              yPosNonOverlapping: 214,
              yposRows: 290
            },
            key: []
          }
        };
        console.log("proteinSequenceView", arguments);
        window.TEST = scope;
        return scope.$on("proteinSequenceView.updateProteinView", function(evt, params) {
          return updateView(scope, element);
        });
      },
      template: "<div class='protein-sequence-view-container' id='protein-sequence-view-container-div'>!!</div>"
    };
  }
]);
;
angular.module("GlycReSoftMSMSGlycopeptideResultsViewApp").directive("ambiguityPlot", [
  "$window", function($window) {
    var ambiguityPlotTemplater, ms1MassGroupingFn, positionGroupingFn, scalingDownFn, scalingUpFn, updatePlot;
    scalingDownFn = function(value) {
      return Math.log(value);
    };
    scalingUpFn = function(value) {
      return Math.exp(value);
    };
    ambiguityPlotTemplater = function(scope, seriesData, xAxisTitle, yAxisTitle) {
      var ambiguityPlotTemplateImpl, infitesimal;
      infitesimal = 1 / (Math.pow(1000, 1000));
      return ambiguityPlotTemplateImpl = {
        chart: {
          height: $window.innerHeight * 0.6,
          type: "bubble",
          zoomType: 'xy'
        },
        plotOptions: {
          series: {
            point: {
              events: {
                click: function(evt) {
                  var chart, point, xs, ys;
                  point = this;
                  chart = this.series.chart;
                  xs = _.pluck(this.series.points, "x");
                  ys = _.pluck(this.series.points, "y");
                  scope.$apply(function() {
                    return scope.describedPredictions = _.pluck(point.series.points, "data");
                  });
                  console.log(this);
                  chart.xAxis[0].setExtremes(Math.min.apply(null, xs) * (1 - infitesimal), Math.max.apply(null, xs) * (1 + infitesimal));
                  chart.yAxis[0].setExtremes(Math.min.apply(null, ys) * (1 - infitesimal), Math.max.apply(null, ys) * (1 + infitesimal));
                  return chart.showResetZoom();
                }
              }
            },
            states: {
              hover: false
            }
          }
        },
        legend: {
          title: {
            text: "<b>Legend</b> <small>(click series to hide)</small>"
          },
          align: 'right',
          verticalAlign: 'top',
          y: 60,
          width: 200,
          height: $window.innerHeight * .8
        },
        tooltip: {
          formatter: function() {
            var contents, point;
            point = this.point;
            contents = " MS1 Score: <b>" + point.x + "</b><br/> Mass: <b>" + (scalingUpFn(point.z)) + "</b><br/> MS2 Score: <b>" + point.y + "</b>(ME: <i>" + point.MS2_ScoreMeanError + "</i>)<br/> Number of Matches: <b>" + point.series.data.length + "</b><br/>";
            return contents;
          },
          headerFormat: "<span style=\"color:{series.color}\">●</span> {series.name}</span><br/>",
          pointFormat: " MS1 Score: <b>{point.x}</b>" + "<br/>Mass: <b>{point.z}</b><br/>MS2 Score: <b>{point.y}</b>(ME: <i>{point.MS2_ScoreMeanError}</i>)<br/> Number of Matches: <b>{series.data.length}</b><br/>",
          positioner: function(boxWidth, boxHeight, point) {
            var ttAnchor;
            ttAnchor = {
              x: point.plotX,
              y: point.plotY
            };
            ttAnchor.x -= boxWidth * 1;
            if (ttAnchor.x <= 0) {
              ttAnchor.x += 2 * (boxWidth * 1);
            }
            return ttAnchor;
          }
        },
        title: {
          text: "Ambiguous Groups Plot"
        },
        xAxis: {
          title: {
            text: xAxisTitle
          },
          events: {}
        },
        yAxis: {
          title: {
            text: yAxisTitle
          }
        },
        series: seriesData
      };
    };
    ms1MassGroupingFn = function(predictions) {
      var ionMassMS1Groups, ionMassMS1Series, ionPoints, notAmbiguous, p, perfectAmbiguous;
      ionPoints = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = predictions.length; _i < _len; _i++) {
          p = predictions[_i];
          _results.push({
            x: p.MS1_Score,
            y: p.MS2_Score,
            z: scalingDownFn(p.Obs_Mass),
            data: p
          });
        }
        return _results;
      })();
      ionMassMS1Groups = _.groupBy(ionPoints, function(pred) {
        return pred.x.toFixed(3) + "-" + pred.z.toFixed(3);
      });
      ionMassMS1Series = [];
      notAmbiguous = [];
      perfectAmbiguous = [];
      _.forEach(ionMassMS1Groups, function(group, id) {
        var i, mean, meanError, s, scoreRange, _i, _j, _len, _ref;
        if (group.length === 1) {
          _.forEach(group, function(pred) {
            return pred.MS2_ScoreMeanError = 0;
          });
          return notAmbiguous.push({
            data: group,
            name: "MS1/Mass " + id
          });
        } else {
          scoreRange = _.pluck(group, "y");
          mean = 0;
          for (_i = 0, _len = scoreRange.length; _i < _len; _i++) {
            s = scoreRange[_i];
            mean += s;
          }
          mean /= scoreRange.length;
          meanError = (function() {
            var _j, _len1, _results;
            _results = [];
            for (_j = 0, _len1 = scoreRange.length; _j < _len1; _j++) {
              s = scoreRange[_j];
              _results.push(s - mean);
            }
            return _results;
          })();
          for (i = _j = 0, _ref = group.length; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
            group[i].MS2_ScoreMeanError = meanError[i] === 0 ? 0 : meanError[i].toFixed(4);
          }
          return ionMassMS1Series.push({
            data: group,
            name: "MS1/Mass " + id
          });
        }
      });
      return {
        ionSeries: ionMassMS1Series,
        notAmbiguous: notAmbiguous
      };
    };
    positionGroupingFn = function(predictions) {
      var ionPoints, ionStartLengthGroups, ionStartLengthSeries, notAmbiguous, p, perfectAmbiguous;
      ionPoints = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = predictions.length; _i < _len; _i++) {
          p = predictions[_i];
          _results.push({
            x: p.startAA,
            y: p.MS2_Score,
            z: p.endAA - p.startAA,
            data: p
          });
        }
        return _results;
      })();
      ionStartLengthGroups = _.groupBy(ionPoints, function(pred) {
        return pred.x.toFixed(3) + "-" + pred.z.toFixed(3);
      });
      ionStartLengthSeries = [];
      notAmbiguous = [];
      perfectAmbiguous = [];
      _.forEach(ionStartLengthGroups, function(group, id) {
        var i, mean, meanError, s, scoreRange, _i, _j, _len, _ref;
        if (group.length === 1) {
          _.forEach(group, function(pred) {
            return pred.MS2_ScoreMeanError = 0;
          });
          return ionStartLengthSeries.push({
            data: group,
            name: "Start AA/Length  " + id
          });
        } else {
          scoreRange = _.pluck(group, "y");
          mean = 0;
          for (_i = 0, _len = scoreRange.length; _i < _len; _i++) {
            s = scoreRange[_i];
            mean += s;
          }
          mean /= scoreRange.length;
          meanError = (function() {
            var _j, _len1, _results;
            _results = [];
            for (_j = 0, _len1 = scoreRange.length; _j < _len1; _j++) {
              s = scoreRange[_j];
              _results.push(s - mean);
            }
            return _results;
          })();
          for (i = _j = 0, _ref = group.length; 0 <= _ref ? _j < _ref : _j > _ref; i = 0 <= _ref ? ++_j : --_j) {
            group[i].MS2_ScoreMeanError = meanError[i] === 0 ? 0 : meanError[i].toFixed(4);
          }
          return ionStartLengthSeries.push({
            data: group,
            name: "Start AA/Length " + id
          });
        }
      });
      return {
        ionSeries: ionStartLengthSeries,
        notAmbiguous: notAmbiguous
      };
    };
    updatePlot = function(predictions, scope, element) {
      var chart, groupParams, ionSeries, notAmbiguous, plotOptions, xAxisTitle, yAxisTitle, _ref;
      groupParams = scope.grouping.groupingFnKey;
      console.log("Grouping Parameters: ", groupParams);
      scope.seriesData = groupParams.groupingFn(predictions);
      console.log("Series Data: ", scope.seriesData);
      scope.describedPredictions = [];
      _ref = scope.seriesData, ionSeries = _ref.ionSeries, notAmbiguous = _ref.notAmbiguous;
      plotOptions = ambiguityPlotTemplater(scope, ionSeries, xAxisTitle = groupParams.xAxisTitle, yAxisTitle = groupParams.yAxisTitle);
      console.log(plotOptions);
      chart = element.find(".ambiguity-plot-container");
      return chart.highcharts(plotOptions);
    };
    return {
      restrict: "AE",
      template: "<div class='amiguity-container'> <div class='plot-grouping-fn-selector-container'> <select class='plot-grouping-fn-selector-box' ng-model='grouping.groupingFnKey' ng-options='key for (key, value) in grouping.groupingsOptions' ng-change='requestPredictionsUpdate()'> </select> </div> <div class='ambiguity-plot-container'></div> <div class='ambiguity-peptide-sequences-container' ng-if='describedPredictions.length > 0'> <div class='ambiguity-peptide-attributes-container clearfix'> <div class='pull-left ambiguity-peptide-attributes'> <p>MS2 Score Range: {{describedMS2Min}} - {{describedMS2Max}}</p> <p>Peptide Region: {{describedPredictions[0].startAA}} - {{describedPredictions[0].endAA}}</p> </div> <div class='pull-left ambiguity-peptide-attributes'> <p>Peptide Sequence: {{describedPredictions[0].Peptide}}</p> <p>Distinct Glycan Count: {{keys(_.groupBy(describedPredictions, 'Glycan')).length}} </div> </div> <table class='table table-striped table-compact ambiguity-peptide-sequences-table'> <tr> <th>Glycopeptide Identifier</th> <th>Peptide Coverage</th> <th># Stub Ions</th> <th>B | Y Ions Coverage (+HexNAc)</th> <th>MS2 Score</th> </tr> <tr ng-repeat='match in describedPredictions | orderBy:[\"MS2_Score\",\"Glycan\",\"numStubs\"]:true'> <td ng-bind-html='match.Glycopeptide_identifier | highlightModifications'></td> <td>{{match.meanCoverage | number:4}}</td> <td>{{match.Stub_ions.length}}</td> <td>{{match.percent_b_ion_coverage * 100|number:1}}%({{match.percent_b_ion_with_HexNAc_coverage * 100|number:1}}%) | {{match.percent_y_ion_coverage * 100|number:1}}%({{match.percent_y_ion_with_HexNAc_coverage * 100|number:1}}%) </td> <td>{{match.MS2_Score}}</td> </tr> </table> </div> </div>",
      link: function(scope, element, attr) {
        scope.describedPredictions = [];
        scope.describedMS2Min = 0;
        scope.describedMS2Max = 0;
        scope.grouping = {};
        scope.grouping.groupingsOptions = {
          "MS1 Score + Mass": {
            groupingFn: ms1MassGroupingFn,
            xAxisTitle: "MS1 Score",
            yAxisTitle: "MS2 Score"
          },
          "Start AA + Length": {
            groupingFn: positionGroupingFn,
            xAxisTitle: "Peptide Start Position",
            yAxisTitle: "MS2 Score"
          }
        };
        scope._ = _;
        scope.keys = Object.keys;
        scope.grouping.groupingFnKey = scope.grouping.groupingsOptions["MS1 Score + Mass"];
        angular.element($window).bind('resize', function() {
          var chart;
          try {
            chart = element.find(".ambiguity-plot-container").highcharts();
            return chart.setSize($window.innerWidth, $window.innerHeight * 0.6);
          } catch (_error) {}
        });
        scope.$watch("describedPredictions", function(newVal) {
          var scoreRange;
          scoreRange = _.pluck(scope.describedPredictions, 'MS2_Score');
          scope.describedMS2Min = Math.min.apply(null, scoreRange);
          scope.describedMS2Max = Math.max.apply(null, scoreRange);
          return scope.$emit("selectedPredictions", {
            selectedPredictions: scope.describedPredictions
          });
        });
        scope.$on("ambiguityPlot.renderPlot", function(evt, params) {
          console.log("Received", arguments);
          return updatePlot(scope.predictions, scope, element);
        });
        return scope.requestPredictionsUpdate = function(opts) {
          if (opts == null) {
            opts = {};
          }
          console.log("Requesting Updates");
          return scope.$emit("ambiguityPlot.requestPredictionsUpdate", opts);
        };
      }
    };
  }
]);
;
var fragmentIon;

fragmentIon = GlycReSoftMSMSGlycopeptideResultsViewApp.directive("fragmentIon", function() {
  return {
    restrict: "AE",
    template: "<p class='fragment-ion-tag'><b>PPM Error</b>: {{fragment_ion.ppm_error|scientificNotation}} &nbsp; <b>Key</b>: {{fragment_ion.key}}</p>"
  };
});
;
var resizeable;

resizeable = GlycReSoftMSMSGlycopeptideResultsViewApp.directive('resizable', function($window) {
  return {
    restrict: "A",
    scope: {
      percent: "=windowPercent"
    },
    link: function(scope, element) {
      var windowPercent;
      windowPercent = scope.percent;
      scope.initializeWindowSize = function() {
        scope.windowHeight = $window.innerHeight * windowPercent;
        scope.windowWidth = $window.innerWidth;
        return element.css("height", scope.windowHeight + "px");
      };
      scope.initializeWindowSize();
      return angular.element($window).bind('resize', function() {
        scope.initializeWindowSize();
        return scope.$apply();
      });
    }
  };
});
;
angular.module("GlycReSoftMSMSGlycopeptideResultsViewApp").directive("saveCsv", [
  "csvService", function(csvService) {
    var saveCsv;
    saveCsv = function(predictions, element) {
      var blob, output;
      if (!((typeof Blob !== "undefined" && Blob !== null) && (typeof saveAs !== "undefined" && saveAs !== null))) {
        alert("File Saving is not supported with this browser");
        return;
      }
      output = csvService.format(predictions);
      blob = new Blob([output], {
        type: "text/csv;charset=utf-8"
      });
      return saveAs(blob, "results.csv");
    };
    return {
      link: function(scope, element, attrs) {
        console.log("Save-Csv", arguments);
        return element.click(function() {
          return saveCsv(scope._predictionsReceiver, element);
        });
      }
    };
  }
]);
;
angular.module('GlycReSoftMSMSGlycopeptideResultsViewApp').directive("popoverHtmlUnsafePopup", function() {
  return {
    restrict: "EA",
    replace: true,
    scope: {
      title: "@",
      content: "@",
      placement: "@",
      animation: "&",
      isOpen: "&"
    },
    template: '<div class="popover {{placement}}" ng-class="{ in: isOpen(), fade: animation() }"> <div class="arrow"></div> <div class="popover-inner"> <h3 class="popover-title" ng-bind="title" ng-show="title"></h3> <div class="popover-content" bind-html-unsafe="content"></div> </div> </div>'
  };
}).directive("popoverHtmlUnsafe", [
  "$tooltip", function($tooltip) {
    console.log(arguments);
    return $tooltip("popoverHtmlUnsafe", "popover", "click");
  }
]);
;
angular.module("GlycReSoftMSMSGlycopeptideResultsViewApp").directive("helpMenu", [
  "$modal", function($modal) {
    return {
      link: function(scope, element, attrs) {
        console.log("Help", arguments);
        return element.click(function() {
          var modalInstance;
          return modalInstance = $modal.open({
            templateUrl: 'Web/templates/help-text.html',
            size: 'lg'
          });
        });
      }
    };
  }
]);
;
angular.module("GlycReSoftMSMSGlycopeptideResultsViewApp").filter("highlightModifications", [
  "colorService", "$sce", function(colorService, $sce) {
    return function(input, sce) {
      var frag, fragments, modName, out, regex, _i, _len;
      if (input == null) {
        input = '';
      }
      if (sce == null) {
        sce = true;
      }
      out = "";
      regex = /(\(.+?\)|\[.+?\])/;
      fragments = input.split(regex);
      for (_i = 0, _len = fragments.length; _i < _len; _i++) {
        frag = fragments[_i];
        if (frag.charAt(0) === "(") {
          modName = frag.replace(/\(|\)/g, "");
          out += "<span class='mod-string' style='color:" + (colorService.getColor(modName)) + "'>" + frag + "</span>";
        } else if (frag.charAt(0) === "[") {
          out += " <b>" + frag + "</b>";
        } else {
          out += frag;
        }
      }
      if (sce) {
        out = $sce.trustAsHtml(out);
      }
      return out;
    };
  }
]);
;
angular.module("GlycReSoftMSMSGlycopeptideResultsViewApp").filter("scientificNotation", function() {
  return function(input, options) {
    var decimals, exponent, fractionSize, fractional, integer, mantissa, sciNot, stringForm, _ref, _ref1, _ref2;
    if (options == null) {
      options = {};
    }
    decimals = options.decimals || 5;
    fractionSize = (options.fraction || 5) + 2;
    if ((typeof input) !== "number") {
      input = parseFloat(input);
    }
    stringForm = input.toString();
    if ((input < (Math.pow(10, decimals))) && (stringForm.indexOf('.') !== -1)) {
      _ref = stringForm.split("."), integer = _ref[0], mantissa = _ref[1];
      if ((mantissa.length > decimals) || (stringForm.length > (decimals * 2))) {
        sciNot = input.toExponential();
        _ref1 = sciNot.split(/e/), fractional = _ref1[0], exponent = _ref1[1];
        if (fractional.length > fractionSize) {
          fractional = fractional.slice(0, fractionSize);
        }
        return fractional + "e" + exponent;
      } else {
        return input;
      }
    } else if (input > Math.pow(10, decimals)) {
      sciNot = input.toExponential();
      _ref2 = sciNot.split(/e/), fractional = _ref2[0], exponent = _ref2[1];
      if (fractional.length > fractionSize) {
        fractional = fractional.slice(0, fractionSize);
      }
      return fractional + "e" + exponent;
    } else {
      return input;
    }
  };
});
