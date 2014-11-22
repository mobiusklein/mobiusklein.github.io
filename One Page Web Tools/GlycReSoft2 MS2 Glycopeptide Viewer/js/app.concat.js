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

if (Number.isInteger == null) {
  Number.isInteger = function(nVal) {
    return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor(nVal) === nVal;
  };
}
;
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
        match['groupBySize'] = matches.length;
      }
      return id++;
    });
    return predictions;
  };
  applyFiltrex = function(predictions, filtrexExpr) {
    var filt, filterResults, i, passed, _i, _ref;
    filt = compileExpression(filtrexExpr);
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
    return grid.$viewport.scrollTop(position);
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
      label: "Require Stub Ion Matches",
      filtrex: "Stub Ion Count > 0"
    },
    requireIonsWithHexNAc: {
      label: "Require Peptide Backbone Ion Fragment with HexNAc Matches",
      filtrex: "Mean PeptideHexNAc Coverage > 0"
    },
    requirePeptideLongerThanN: {
      label: "Require Peptide longer than 9 AA",
      filtrex: "AA Length > 9"
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
      var headerCellTemplateNoPin, orderBy;
      orderBy = $filter("orderBy");
      $scope.helpText = helpText;
      $scope.filterRules = filterRules;
      $scope.groupingRules = groupingRules;
      $scope.predictions = [];
      $scope._predictions = [];
      $scope._predictionsReceiver = [];
      $scope.name = "GlycReSoft 2 Tandem MS Glycopeptide Analyzer";
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
          focusRow($scope, topIndex);
          return 0;
        }
      };
      $scope.buildHeaderSubstituitionDictionary = function() {
        var BLACK_LIST, column, dictionary, _i, _len, _ref;
        dictionary = {};
        dictionary.NAME_MAP = [];
        BLACK_LIST = {
          "Peptide Span": true,
          "b Ions": true,
          "b Ions With HexNAc": true,
          "y Ions": true,
          "y Ions With HexNAc": true,
          "Stub Ions": true,
          "Oxonium Ions": true
        };
        _ref = $scope.gridOptions.columnDefs;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          column = _ref[_i];
          if (!BLACK_LIST[column.displayName]) {
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
        dictionary["% y Ion Coverage".toLowerCase()] = "percent_y_ion_coverage";
        dictionary.NAME_MAP.push("% y Ion Coverage");
        dictionary["% b Ion Coverage".toLowerCase()] = "percent_b_ion_coverage";
        dictionary.NAME_MAP.push("% b Ion Coverage");
        dictionary["% y Ion With HexNAc Coverage".toLowerCase()] = "percent_y_ion_with_HexNAc_coverage";
        dictionary.NAME_MAP.push("% y Ion With HexNAc Coverage");
        dictionary["% b Ion With HexNAc Coverage".toLowerCase()] = "percent_b_ion_with_HexNAc_coverage";
        dictionary.NAME_MAP.push("% b Ion With HexNAc Coverage");
        return dictionary;
      };
      headerCellTemplateNoPin = '<div class="ngHeaderSortColumn {{col.headerClass}}" ng-style="{\'cursor\': col.cursor}" ng-class="{ \'ngSorted\': !noSortVisible }"> <div ng-click="col.sort($event)" ng-class="\'colt\' + col.index" class="ngHeaderText">{{col.displayName}}</div> <div class="ngSortButtonDown" ng-show="col.showSortButtonDown()"></div> <div class="ngSortButtonUp" ng-show="col.showSortButtonUp()"></div> <div class="ngSortPriority">{{col.sortPriority}}</div> </div> <div ng-show="col.resizable" class="ngHeaderGrip" ng-click="col.gripClick($event)" ng-mousedown="col.gripOnMouseDown($event)"></div>';
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
            field: 'scan_id',
            width: 90,
            pinned: true,
            displayName: "Scan ID",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)}}</div></div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'MS2_Score',
            width: 90,
            pinned: true,
            displayName: "MS2 Score",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)|number:4}}</div></div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'MS1_Score',
            width: 90,
            pinned: true,
            displayName: "MS1 Score",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)|number:4}}</div></div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'Obs_Mass',
            width: 130,
            pinned: true,
            displayName: "Observed Mass",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)|number:4}}</div></div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'vol',
            width: 100,
            pinned: true,
            displayName: "Volume",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)|number:3}}</div></div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'ppm_error',
            width: 90,
            displayName: "PPM Error",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)|scientificNotation|number:4}}</div></div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'Glycopeptide_identifier',
            width: 240,
            displayName: "Glycopeptide Sequence",
            cellClass: "matched-ions-cell glycopeptide-identifier",
            cellTemplate: '<div><div class="ngCellText" ng-bind-html="row.getProperty(col.field)|highlightModifications"></div></div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'meanCoverage',
            width: 180,
            displayName: "Mean Peptide Coverage",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)|number:3}}</div></div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'meanHexNAcCoverage',
            width: 180,
            displayName: "Mean PeptideHexNAc Coverage",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)|number:3}}</div></div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'percentUncovered',
            width: 165,
            displayName: "% Peptide Uncovered",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field) * 100|number:2}}</div></div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: "startAA",
            width: 180,
            displayName: "Peptide Span",
            cellTemplate: '<div><div class="ngCellText matched-ions-cell">{{row.getProperty(col.field)}}-{{row.entity.endAA}}&nbsp;({{row.entity.peptideLens}})</div></div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'Oxonium_ions',
            width: 200,
            headerClass: null,
            displayName: "Oxonium Ions",
            cellClass: "stacked-ions-cell-grid",
            cellTemplate: '<div> <div class="ngCellText"> <div class="coverage-text">{{row.entity.numOxIons}} Ions Matched</div> <fragment-ion ng-repeat="fragment_ion in row.getProperty(col.field)"></fragment-ion> </div> </div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'Stub_ions',
            width: 340,
            displayName: "Stub Ions",
            headerClass: null,
            cellClass: "stacked-ions-cell-grid",
            cellTemplate: '<div> <div class="ngCellText"> <div class="coverage-text">{{row.entity.numStubs}} Ions Matched</div> <fragment-ion ng-repeat="fragment_ion in row.getProperty(col.field)"></fragment-ion> </div> </div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'b_ion_coverage',
            width: 340,
            displayName: "b Ions",
            headerClass: null,
            cellClass: "stacked-ions-cell-grid",
            cellTemplate: '<div> <div class="ngCellText"> <div class="coverage-text">{{row.entity.percent_b_ion_coverage * 100|number:1}}% Coverage</div> <fragment-ion ng-repeat="fragment_ion in row.getProperty(col.field)"></fragment-ion> </div> </div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'y_ion_coverage',
            width: 340,
            displayName: "y Ions",
            headerClass: null,
            cellClass: "stacked-ions-cell-grid",
            cellTemplate: '<div> <div class="ngCellText"> <div class="coverage-text">{{row.entity.percent_y_ion_coverage * 100|number:1}}% Coverage</div> <fragment-ion ng-repeat="fragment_ion in row.getProperty(col.field)"></fragment-ion> </div> </div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'b_ions_with_HexNAc',
            width: 340,
            displayName: "b Ions with HexNAc",
            headerClass: null,
            cellClass: "stacked-ions-cell-grid",
            cellTemplate: '<div> <div class="ngCellText"> <div class="coverage-text">{{row.entity.percent_b_ion_with_HexNAc_coverage * 100 |number:1}}% Coverage</div> <fragment-ion ng-repeat="fragment_ion in row.getProperty(col.field)"></fragment-ion> </div> </div>',
            headerCellTemplate: headerCellTemplateNoPin
          }, {
            field: 'y_ions_with_HexNAc',
            width: 340,
            displayName: "y Ions with HexNAc",
            headerClass: null,
            cellClass: "stacked-ions-cell-grid",
            cellTemplate: '<div> <div class="ngCellText"> <div class="coverage-text">{{row.entity.percent_y_ion_with_HexNAc_coverage * 100|number:1}}% Coverage</div> <fragment-ion ng-repeat="fragment_ion in row.getProperty(col.field)"></fragment-ion> </div> </div>',
            headerCellTemplate: headerCellTemplateNoPin
          }
        ],
        rowTemplate: '<div style="height: 100%" class="{{row.entity.groupBySize > 1 ? \'c\' + row.entity.groupBy % 6 : \'cX\'}}"> <div ng-style="{ \'cursor\': row.cursor }" ng-repeat="col in renderedColumns" ng-class="col.colIndex()" class="ngCell matched-ions-cell"> <div class="ngVerticalBar" ng-style="{height: rowHeight}" ng-class="{ ngVerticalBarVisible: !$last }"> </div> <div ng-cell> </div> </div> </div>'
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
    this.serializedFields = ["Oxonium_ions", "Stub_ions", "bare_b_ions", "bare_y_ions", "b_ion_coverage", "y_ion_coverage", "b_ions_with_HexNAc", "y_ions_with_HexNAc", "startAA", "endAA", "vol", "peptideLens", "numOxIons", "numStubs", "scan_id", "meanCoverage", "percentUncovered", "meanHexNAcCoverage", "peptideCoverageMap", "hexNAcCoverageMap", "bIonCoverageMap", "bIonCoverageWithHexNAcMap", "yIonCoverageMap", "yIonCoverageWithHexNAcMap", "MS1_Score", "MS2_Score", "Obs_Mass", "Calc_mass", 'ppm_error', 'abs_ppm_error', 'percent_b_ion_with_HexNAc_coverage', 'percent_y_ion_with_HexNAc_coverage'];
    this.defaultValues = {
      "hexNAcCoverageMap": function(pred) {
        var i;
        return [
          (function() {
            var _i, _ref, _results;
            _results = [];
            for (i = _i = 0, _ref = pred.peptideLens; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
              _results.push(0);
            }
            return _results;
          })()
        ];
      },
      "peptideCoverageMap": function(pred) {
        var i;
        return [
          (function() {
            var _i, _ref, _results;
            _results = [];
            for (i = _i = 0, _ref = pred.peptideLens; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
              _results.push(0);
            }
            return _results;
          })()
        ];
      },
      "meanHexNAcCoverage": function(pred) {
        return 0.0;
      },
      "bIonCoverageMap": function(pred) {
        var i;
        return [
          (function() {
            var _i, _ref, _results;
            _results = [];
            for (i = _i = 0, _ref = pred.peptideLens; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
              _results.push(0);
            }
            return _results;
          })()
        ];
      },
      "bIonCoverageWithHexNAcMap": function(pred) {
        var i;
        return [
          (function() {
            var _i, _ref, _results;
            _results = [];
            for (i = _i = 0, _ref = pred.peptideLens; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
              _results.push(0);
            }
            return _results;
          })()
        ];
      },
      "yIonCoverageMap": function(pred) {
        var i;
        return [
          (function() {
            var _i, _ref, _results;
            _results = [];
            for (i = _i = 0, _ref = pred.peptideLens; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
              _results.push(0);
            }
            return _results;
          })()
        ];
      },
      "yIonCoverageWithHexNAcMap": function(pred) {
        var i;
        return [
          (function() {
            var _i, _ref, _results;
            _results = [];
            for (i = _i = 0, _ref = pred.peptideLens; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
              _results.push(0);
            }
            return _results;
          })()
        ];
      }
    };
    this.parse = function(stringData) {
      var instantiatedData, rowData;
      rowData = d3.csv.parse(stringData);
      instantiatedData = this.deserializeAfterParse(rowData);
      this.defaultValues(instantiatedData);
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
    this.setDefaultValues = function(predictions) {
      var defaultFn, key, pred, _i, _len, _ref;
      for (_i = 0, _len = predictions.length; _i < _len; _i++) {
        pred = predictions[_i];
        _ref = this.defaultValues;
        for (key in _ref) {
          defaultFn = _ref[key];
          if (pred[key] == null) {
            pred[key] = defaultFn(pred);
          }
        }
      }
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
    return $window.csvService = this;
  }
]);
;
var ColorSource;

ColorSource = (function() {
  function ColorSource() {}

  ColorSource.colors = ["blue", "rgb(228, 211, 84)", "red", "purple", "grey", "black", "green", "orange", "brown"];

  ColorSource.pepColors = ["seagreen", "mediumseagreen", "green", "limegreen", "darkgreen"];

  ColorSource.colorIters = {
    "_colorIter": 0,
    "_pepColorIter": 0
  };

  ColorSource.colorMapDefault = {
    modColorMap: {
      HexNAc: "#CC99FF"
    },
    pepColorMap: {}
  };

  ColorSource.colorMap = {
    modColorMap: {
      HexNAc: "#CC99FF"
    },
    pepColorMap: {}
  };

  ColorSource.resetMap = function(key) {
    return this.colorMap[key] = _.cloneDeep(this.colorMapDefault[key]);
  };

  ColorSource._nextColor = function() {
    var color;
    color = this.colors[this.colorIters["_colorIter"]++];
    if (this.colorIters["_colorIter"] >= this.colors.length) {
      this.colorIters["_colorIter"] = 0;
    }
    return color;
  };

  ColorSource._nextPepColor = function() {
    var color;
    color = this.pepColors[this.colorIters["_pepColorIter"]++];
    if (this.colorIters["_pepColorIter"] >= this.pepColors.length) {
      this.colorIters["_pepColorIter"] = 0;
    }
    return color;
  };

  ColorSource.getColor = function(label) {
    if (!(label in this.colorMap.modColorMap)) {
      this.colorMap.modColorMap[label] = this._nextColor();
    }
    return this.colorMap.modColorMap[label];
  };

  ColorSource.getPepColor = function(label) {
    if (!(label in this.colorMap.pepColorMap)) {
      this.colorMap.pepColorMap[label] = this._nextPepColor();
    }
    return this.colorMap.pepColorMap[label];
  };

  ColorSource.resetPepColors = function() {
    return this.resetMap("pepColorMap");
  };

  return ColorSource;

})();

angular.module("GlycReSoftMSMSGlycopeptideResultsViewApp").service("colorService", [
  function() {
    return ColorSource;
  }
]);
;
var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

angular.module("GlycReSoftMSMSGlycopeptideResultsViewApp").directive("proteinSequenceView", [
  "$window", "$filter", "colorService", "$modal", "$timeout", function($window, $filter, colorService, $modal, $timeout) {
    var coverageModalHistogram, featureTemplate, fragmentsContainingModification, fragmentsSurroundingPosition, generateConfig, getBestScoresForModification, heightLayerMap, highlightModifications, legendKeyTemplate, makeGlycanCompositionContent, orderBy, parseGlycopeptideIdentifierToModificationsArray, shapeMap, shapes, transformFeatuersToLegend, transformPredictionGroupsToFeatures, typeCategoryMap, updateView, _layerCounter, _layerIncrement, _shapeIter;
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
          return $('.frequency-plot-container').highcharts({
            data: {
              table: $('.glycan-composition-frequency-table')[0]
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
        }
      };
    };
    coverageModalHistogram = function(glycoform) {
      glycoform.hasModalContent = true;
      return glycoform.modalOptions = {
        title: "Peptide Coverage",
        summary: "<div class='frequency-plot-container'></div>",
        items: [],
        postLoadFn: function() {
          return new PlotUtils.BackboneStackChart(glycoform._obj, ".frequency-plot-container").render();
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
      var arrange, colorIter, depth, end, feature, featuresArray, foldedMods, frag, fragRange, fragments, glycoform, glycoformModifications, modifications, sortFn, start, topMods, _i, _j, _len, _len1, _ref;
      fragments = _.groupBy(predictions, function(p) {
        return [p.startAA, p.endAA];
      });
      featuresArray = [];
      modifications = [];
      sortFn = function(a, b) {
        var aEnd, aLen, aStart, bEnd, bLen, bStart, _ref, _ref1;
        _ref = a.split(','), aStart = _ref[0], aEnd = _ref[1];
        _ref1 = b.split(','), bStart = _ref1[0], bEnd = _ref1[1];
        aLen = aEnd - aStart;
        bLen = bEnd - bStart;
        if (aLen > bLen) {
          return -1;
        } else if (aLen < bLen) {
          return 1;
        } else {
          return 0;
        }
      };
      arrange = Object.keys(fragments).sort(sortFn);
      colorIter = 0;
      for (_i = 0, _len = arrange.length; _i < _len; _i++) {
        fragRange = arrange[_i];
        _ref = fragRange.split(","), start = _ref[0], end = _ref[1];
        frag = fragments[fragRange];
        depth = 1;
        frag = orderBy(frag, "MS2_Score").reverse();
        for (_j = 0, _len1 = frag.length; _j < _len1; _j++) {
          glycoform = frag[_j];
          feature = _.cloneDeep(featureTemplate);
          feature.type = shapeMap.Peptide;
          feature.fill = colorService.getPepColor("Peptide" + glycoform.scan_id);
          feature.stroke = colorService.getPepColor("Peptide" + glycoform.scan_id);
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
          feature.additionalTooltipContent = "<br/>Scan ID: " + glycoform.scan_id + "<br/>Mass: " + glycoform.Obs_Mass;
          coverageModalHistogram(feature);
          featuresArray.push(feature);
          depth++;
        }
        colorIter++;
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
      colorService.resetPepColors();
      scope.featureViewerConfig.featuresArray = transformPredictionGroupsToFeatures(scope.predictions);
      scope.scanMap = _.groupBy(_.filter(scope.featureViewerConfig.featuresArray, function(obj) {
        return obj.featureTypeLabel === "glycopeptide_match";
      }), function(obj) {
        return obj._obj.scan_id;
      });
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
        var feature, id, preds;
        id = featureShape.featureId;
        feature = _.find(scope.featureViewerConfig.featuresArray, {
          featureId: id
        });
        if (feature.hasModalContent) {
          window.modalInstance = $modal.open({
            templateUrl: "templates/summary-modal.html",
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
          preds = [];
          if (feature._obj.scan_id != null) {
            preds = _.pluck(scope.scanMap[feature._obj.scan_id], "_obj");
          } else {
            preds = [feature._obj];
          }
          return scope.$emit("selectedPredictions", {
            selectedPredictions: preds
          });
        }
      });
      scope.featureViewerInstance.onFeatureOn(function(featureShape) {
        var ambiguousMatches, feat, featId, featShape, feature, id, mod, modId, _i, _j, _len, _len1, _ref, _results;
        id = featureShape.featureId;
        feature = _.find(scope.featureViewerConfig.featuresArray, {
          featureId: id
        });
        if (feature.modifications != null) {
          _ref = feature.modifications;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            mod = _ref[_i];
            modId = "uniprotFeaturePainter_" + mod;
            scope.featureViewerInstance.raphael.getById(modId).transform("s2").attr("fill-opacity", 1);
          }
        }
        if (feature._obj.scan_id != null) {
          ambiguousMatches = scope.scanMap[feature._obj.scan_id];
          _results = [];
          for (_j = 0, _len1 = ambiguousMatches.length; _j < _len1; _j++) {
            feat = ambiguousMatches[_j];
            featId = "uniprotFeaturePainter_" + feat.featureId;
            featShape = scope.featureViewerInstance.raphael.getById(featId);
            _results.push(featShape.attr("fill", "red"));
          }
          return _results;
        }
      });
      scope.featureViewerInstance.onFeatureOff(function(featureShape) {
        var ambiguousMatches, feat, featId, featShape, feature, id, mod, modId, _i, _j, _len, _len1, _ref, _results;
        id = featureShape.featureId;
        feature = _.find(scope.featureViewerConfig.featuresArray, {
          featureId: id
        });
        if (feature.modifications != null) {
          _ref = feature.modifications;
          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
            mod = _ref[_i];
            modId = "uniprotFeaturePainter_" + mod;
            scope.featureViewerInstance.raphael.getById(modId).transform("s1").attr("fill-opacity", 0.5);
          }
        }
        if (feature._obj.scan_id != null) {
          ambiguousMatches = scope.scanMap[feature._obj.scan_id];
          _results = [];
          for (_j = 0, _len1 = ambiguousMatches.length; _j < _len1; _j++) {
            feat = ambiguousMatches[_j];
            featId = "uniprotFeaturePainter_" + feat.featureId;
            featShape = scope.featureViewerInstance.raphael.getById(featId);
            _results.push(featShape.attr("fill", colorService.getPepColor("Peptide" + feat._obj.scan_id)));
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
      scope: {
        predictions: "="
      },
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
        window.TEST = scope;
        scope.$on("proteinSequenceView.updateProteinView", function(evt, params) {
          return updateView(scope, element);
        });
        return scope.$watch("predictions", function() {
          return updateView(scope, element);
        });
      },
      template: "<div class='protein-sequence-view-container' id='protein-sequence-view-container-div'></div>"
    };
  }
]);
;
angular.module("GlycReSoftMSMSGlycopeptideResultsViewApp").directive("ambiguityPlot", [
  "$window", function($window) {
    var ambiguityPlotTemplater, genericGroupingFn, scalingDownFn, scalingUpFn, updatePlot;
    scalingDownFn = function(value) {
      return Math.log(value);
    };
    scalingUpFn = function(value) {
      return Math.exp(value);
    };
    ambiguityPlotTemplater = function(scope, seriesData, xAxisTitle, yAxisTitle, plotType) {
      var ambiguityPlotTemplateImpl, infitesimal;
      if (plotType == null) {
        plotType = 'bubble';
      }
      infitesimal = 1 / (Math.pow(1000, 1000));
      return ambiguityPlotTemplateImpl = {
        chart: {
          height: $window.innerHeight * 0.6,
          type: plotType,
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
            contents = "" + point.titles.x + ": <b>" + point.x + "</b><br/>";
            if (point.titles.z !== "None" && (point.titles.z != null)) {
              contents += "" + point.titles.z + ": <b>" + point.z + "</b><br/>";
            }
            if (point.titles.y !== "" && (point.titles.y != null)) {
              contents += "" + point.titles.y + ": <b>" + point.y + "</b><br/>";
            }
            contents += "Number of Matches: <b>" + point.series.data.length + "</b><br/>";
            return contents;
          },
          headerFormat: "<span style=\"color:{series.color}\">●</span> {series.name}</span><br/>",
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
    genericGroupingFn = function(xAxis, yAxis, zAxis, groupingName) {
      var fn, xAxisGetter, yAxisGetter, zAxisGetter;
      if (groupingName == null) {
        groupingName = "";
      }
      if (groupingName === "") {
        groupingName = xAxis.name;
        if ((zAxis.name != null) && zAxis.name !== "") {
          groupingName += "/" + zAxis.name;
        }
      }
      xAxisGetter = function(p) {
        return p[xAxis.getter];
      };
      if (typeof xAxis.getter === "function") {
        xAxisGetter = function(p) {
          return xAxis.getter(p);
        };
      }
      yAxisGetter = function(p) {
        return p[yAxis.getter];
      };
      if (typeof yAxis.getter === "function") {
        yAxisGetter = function(p) {
          return yAxis.getter(p);
        };
      }
      zAxisGetter = function(p) {
        return p[zAxis.getter];
      };
      if (typeof zAxis.getter === "function") {
        zAxisGetter = function(p) {
          return zAxis.getter(p);
        };
      }
      fn = function(predictions) {
        var ionGroupings, ionPoints, ionSeries, notAmbiguous, p, perfectAmbiguous;
        ionPoints = (function() {
          var _i, _len, _results;
          _results = [];
          for (_i = 0, _len = predictions.length; _i < _len; _i++) {
            p = predictions[_i];
            _results.push({
              x: xAxisGetter(p),
              y: yAxisGetter(p),
              z: zAxisGetter(p),
              data: p,
              titles: {
                x: xAxis.name,
                y: yAxis.name,
                z: zAxis.name
              }
            });
          }
          return _results;
        })();
        ionGroupings = _.groupBy(ionPoints, function(pred) {
          var groupId, xVal, zVal;
          xVal = pred.x;
          if (typeof xVal === "number" && !Number.isInteger(xVal)) {
            xVal = xVal.toFixed(3);
          }
          zVal = pred.z;
          if (typeof zVal === "number" && !Number.isInteger(zVal)) {
            zVal = zVal.toFixed(3);
          }
          groupId = xVal;
          if (zVal != null) {
            groupId += '-' + zVal;
          }
          return groupId;
        });
        ionSeries = [];
        notAmbiguous = [];
        perfectAmbiguous = [];
        _.forEach(ionGroupings, function(group, id) {
          if (group.length === 1) {
            return notAmbiguous.push({
              data: group,
              name: groupingName + " " + id
            });
          } else {
            return ionSeries.push({
              data: group,
              name: groupingName + " " + id
            });
          }
        });
        return {
          ionSeries: ionSeries,
          notAmbiguous: notAmbiguous
        };
      };
      return fn;
    };
    updatePlot = function(predictions, scope, element) {
      var chart, groupParams, ionSeries, notAmbiguous, plotOptions, plotType, xAxisTitle, yAxisTitle, _ref;
      groupParams = scope.grouping.groupingFnKey;
      scope.seriesData = groupParams.groupingFn(predictions);
      scope.describedPredictions = [];
      _ref = scope.seriesData, ionSeries = _ref.ionSeries, notAmbiguous = _ref.notAmbiguous;
      if (!scope.ambiguityPlotParams.hideUnambiguous) {
        ionSeries = ionSeries.concat(notAmbiguous);
      }
      plotOptions = ambiguityPlotTemplater(scope, ionSeries, xAxisTitle = groupParams.xAxisTitle, yAxisTitle = groupParams.yAxisTitle, plotType = groupParams.plotType);
      chart = element.find(".ambiguity-plot-container");
      chart.highcharts(plotOptions);
      return true;
    };
    return {
      restrict: "AE",
      scope: {
        predictions: '=',
        headerSubstituitionDictionary: '=headers'
      },
      templateUrl: "templates/ambiguity-plot-template.html",
      link: function(scope, element, attr) {
        $window.PLOTTING = scope;
        scope.describedPredictions = [];
        scope.describedMS2Min = 0;
        scope.describedMS2Max = 0;
        scope.grouping = {};
        scope.grouping.groupingsOptions = {
          "MS1 Score + Mass": {
            groupingFn: genericGroupingFn({
              name: "MS1 Score",
              getter: "MS1_Score"
            }, {
              name: "MS2 Score",
              getter: "MS2_Score"
            }, {
              name: "Observed Mass",
              getter: "Obs_Mass"
            }),
            xAxisTitle: "MS1 Score",
            yAxisTitle: "MS2 Score",
            plotType: 'bubble'
          },
          "Start AA + Length": {
            groupingFn: genericGroupingFn({
              name: "Start AA",
              getter: "startAA"
            }, {
              name: "MS2 Score",
              getter: "MS2_Score"
            }, {
              name: "Peptide Length",
              getter: "peptideLens"
            }),
            xAxisTitle: "Peptide Start Position",
            yAxisTitle: "MS2 Score",
            plotType: 'bubble'
          },
          "Scan Number": {
            groupingFn: genericGroupingFn({
              name: 'Scan Number',
              getter: "scan_id"
            }, {
              name: 'Mean Peptide Coverage',
              getter: 'meanCoverage'
            }, {
              name: 'None',
              getter: function(p) {
                return null;
              }
            }),
            xAxisTitle: 'Scan Number',
            yAxisTitle: 'Mean Peptide Coverage',
            plotType: 'scatter'
          }
        };
        scope._ = _;
        scope.keys = Object.keys;
        scope.grouping.groupingFnKey = scope.grouping.groupingsOptions["MS1 Score + Mass"];
        scope.ambiguityPlotParams = {
          showCustomPlotter: false,
          x: "Scan ID",
          y: "MS2 Score",
          z: "None",
          hideUnambiguous: true
        };
        scope.describedPeptideRegions = function() {
          return Object.keys(_.groupBy(scope.describedPredictions, function(p) {
            return p.startAA + '-' + p.endAA;
          })).join('; ');
        };
        scope.plotSelectorChanged = function() {
          updatePlot(scope.predictions, scope, element);
          return true;
        };
        scope.customPlot = function() {
          var groupingParams, x, y, z;
          x = scope.ambiguityPlotParams.x;
          y = scope.ambiguityPlotParams.y;
          z = scope.ambiguityPlotParams.z;
          groupingParams = {
            groupingFn: genericGroupingFn({
              name: x,
              getter: scope.headerSubstituitionDictionary[x.toLowerCase()]
            }, {
              name: y,
              getter: scope.headerSubstituitionDictionary[y.toLowerCase()]
            }, {
              name: z,
              getter: scope.headerSubstituitionDictionary[z.toLowerCase()]
            }),
            xAxisTitle: x,
            yAxisTitle: y,
            plotType: "bubble"
          };
          if (z === "None") {
            groupingParams.plotType = "scatter";
          }
          scope.grouping.groupingsOptions["Custom"] = groupingParams;
          scope.grouping.groupingFnKey = groupingParams;
          updatePlot(scope.predictions, scope, element);
          return true;
        };
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
          return updatePlot(scope.predictions, scope, element);
        });
        scope.$watch("predictions", function() {
          return updatePlot(scope.predictions, scope, element);
        });
        return scope.$watch('ambiguityPlotParams.hideUnambiguous', function(newVal, oldVal) {
          return updatePlot(scope.predictions, scope, element);
        });
      }
    };
  }
]);
;
var fragmentIon;

fragmentIon = GlycReSoftMSMSGlycopeptideResultsViewApp.directive("fragmentIon", function() {
  return {
    restrict: "AE",
    template: "<p class='fragment-ion-tag'><b>PPM Error</b>: {{fragment_ion.ppm_error|number:2}} &nbsp; <b>Key</b>: {{fragment_ion.key}}</p>"
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
    saveCsv = function(predictions, element, fileName) {
      var blob, output;
      if (fileName == null) {
        fileName = "results.csv";
      }
      if (!((typeof Blob !== "undefined" && Blob !== null) && (typeof saveAs !== "undefined" && saveAs !== null))) {
        alert("File Saving is not supported with this browser");
        return;
      }
      output = csvService.format(predictions);
      blob = new Blob([output], {
        type: "text/csv;charset=utf-8"
      });
      return saveAs(blob, fileName);
    };
    return {
      restrict: "EA",
      scope: {
        predictions: '=',
        predictionsUnfiltered: '=',
        mayOpenFile: '='
      },
      templateUrl: "templates/save-csv-menu.html",
      link: function(scope, element, attrs) {
        console.log("Save-Csv!!!", arguments);
        scope.status = {
          isopen: false
        };
        window.TESTCSVBTN = scope;
        element.find(".save-filter-results-anchor").click(function(e) {
          return saveCsv(scope.predictions, element, "filtered-results.csv");
        });
        element.find(".save-all-results-anchor").click(function(e) {
          return saveCsv(scope.predictionsUnfiltered, element, "all-results.csv");
        });
        element.find(".open-file-anchor").click(function(e) {
          return element.find("#file-opener").click();
        });
        return element.find("#file-opener").change(function(e) {
          var fileReader;
          fileReader = new FileReader();
          fileReader.onload = function(e) {
            var fileContents, parsedData;
            fileContents = e.target.result;
            parsedData = d3.csv.parse(fileContents);
            return registerDataChange(parsedData);
          };
          fileReader.readAsText(this.files[0], 'UTF-8');
          return console.log("reading file");
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
            templateUrl: 'templates/help-text.html',
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
;
var ColorSource2;

ColorSource2 = (function() {
  function ColorSource2() {}

  ColorSource2.colors = ["blue", "rgb(228, 211, 84)", "red", "purple", "grey", "black", "green", "orange", "brown"];

  ColorSource2.pepColors = ["seagreen", "mediumseagreen", "green", "limegreen", "darkgreen"];

  ColorSource2.colorIters = {
    "_colorIter": 0,
    "_pepColorIter": 0
  };

  ColorSource2.colorMapDefault = {
    modColorMap: {
      HexNAc: "#CC99FF"
    },
    pepColorMap: {}
  };

  ColorSource2.colorMap = {
    modColorMap: {
      HexNAc: "#CC99FF"
    },
    pepColorMap: {}
  };

  ColorSource2.resetMap = function(key) {
    return this.colorMap[key] = _.cloneDeep(this.colorMapDefault[key]);
  };

  ColorSource2._nextColor = function() {
    var color;
    color = this.colors[this.colorIters["_colorIter"]++];
    if (this.colorIters["_colorIter"] >= this.colors.length) {
      this.colorIters["_colorIter"] = 0;
    }
    return color;
  };

  ColorSource2._nextPepColor = function() {
    var color;
    color = this.pepColors[this.colorIters["_pepColorIter"]++];
    if (this.colorIters["_pepColorIter"] >= this.pepColors.length) {
      this.colorIters["_pepColorIter"] = 0;
    }
    return color;
  };

  ColorSource2.getColor = function(label) {
    if (!(label in this.colorMap.modColorMap)) {
      this.colorMap.modColorMap[label] = this._nextColor();
    }
    return this.colorMap.modColorMap[label];
  };

  ColorSource2.getPepColor = function(label) {
    if (!(label in this.colorMap.pepColorMap)) {
      this.colorMap.pepColorMap[label] = this._nextPepColor();
    }
    return this.colorMap.pepColorMap[label];
  };

  ColorSource2.resetPepColors = function() {
    return this.resetMap("pepColorMap");
  };

  return ColorSource2;

})();
;
var GlycopeptideLib;

GlycopeptideLib = (function() {
  function GlycopeptideLib() {}

  GlycopeptideLib.buildBackboneStack = function(glycopeptide) {
    var bHexNAc, bIon, i, index, key, len, stack, yHexNAc, yIon, _i, _j, _k, _l, _len, _len1, _len2, _len3, _ref, _ref1, _ref2, _ref3;
    stack = (function() {
      var _i, _ref, _results;
      _results = [];
      for (i = _i = 0, _ref = glycopeptide.peptideLens; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        _results.push({
          bIon: [0, 0],
          yIon: [0, 0],
          bHexNAc: [0, 0],
          yHexNAc: [0, 0]
        });
      }
      return _results;
    })();
    len = glycopeptide.peptideLens;
    _ref = glycopeptide.b_ion_coverage;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      bIon = _ref[_i];
      key = bIon.key;
      index = parseInt(key.replace(/B/, ''));
      stack[index].bIon = [0, index];
    }
    _ref1 = glycopeptide.y_ion_coverage;
    for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
      yIon = _ref1[_j];
      key = yIon.key;
      index = parseInt(key.replace(/Y/, ''));
      stack[len - index].yIon = [len - index, len];
    }
    _ref2 = glycopeptide.b_ions_with_HexNAc;
    for (_k = 0, _len2 = _ref2.length; _k < _len2; _k++) {
      bHexNAc = _ref2[_k];
      key = bHexNAc.key;
      index = parseInt(/B([0-9]+)\+/.exec(key)[1]);
      stack[index].bHexNAc = [0, index];
    }
    _ref3 = glycopeptide.y_ions_with_HexNAc;
    for (_l = 0, _len3 = _ref3.length; _l < _len3; _l++) {
      yHexNAc = _ref3[_l];
      key = yHexNAc.key;
      index = parseInt(/Y([0-9]+)\+/.exec(key)[1]);
      stack[len - index].yHexNAc = [len - index, len];
    }
    return stack;
  };

  GlycopeptideLib.parseModificationSites = function(glycopeptide) {
    var feature, frag, fragments, index, label, modifications, regex, sequence, _i, _len;
    sequence = glycopeptide.Glycopeptide_identifier;
    regex = /(\(.+?\)|\[.+?\])/;
    index = 0;
    fragments = sequence.split(regex);
    modifications = [];
    for (_i = 0, _len = fragments.length; _i < _len; _i++) {
      frag = fragments[_i];
      if (frag.charAt(0) === "[") {

      } else if (frag.charAt(0) === "(") {
        label = frag.replace(/\(|\)/g, "");
        feature = {
          name: label,
          position: index
        };
        modifications.push(feature);
      } else {
        index += frag.length;
      }
    }
    return modifications;
  };

  return GlycopeptideLib;

})();
;
var PlotUtils;

PlotUtils = (function() {
  var BackboneStackChart, ModificationDistributionChart, addAlphaToRGB, ns;
  ns = {};
  addAlphaToRGB = function(rgb, opacity) {
    return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + opacity;
  };
  ns.BackboneStackChart = BackboneStackChart = (function() {
    BackboneStackChart.template = {
      chart: {
        type: "columnrange",
        inverted: true
      },
      title: {
        text: "Peptide Backbone Fragment Coverage"
      },
      xAxis: [
        {
          title: {
            text: "Sequence Position"
          },
          allowDecimals: false
        }
      ],
      yAxis: {
        title: {
          text: "Backbone Fragmentation Site"
        },
        allowDecimals: false,
        min: 0,
        max: null
      },
      plotOptions: {
        columnrange: {
          animation: false,
          groupPadding: 0
        }
      },
      legend: {
        enabled: true
      },
      series: []
    };

    function BackboneStackChart(glycopeptide, container) {
      this.glycopeptide = glycopeptide;
      this.container = container;
      this.backboneStack = GlycopeptideLib.buildBackboneStack(this.glycopeptide);
      this.config = _.cloneDeep(BackboneStackChart.template);
      this.config.yAxis.max = this.glycopeptide.peptideLens;
      this.config.series.push({
        name: "b Ion",
        data: _.pluck(this.backboneStack, "bIon")
      });
      this.config.series.push({
        name: "y Ion",
        data: _.pluck(this.backboneStack, "yIon")
      });
      this.config.series.push({
        name: "b Ion + HexNAc",
        data: _.pluck(this.backboneStack, "bHexNAc")
      });
      this.config.series.push({
        name: "y Ion + HexNAc",
        data: _.pluck(this.backboneStack, "yHexNAc")
      });
      this.addModificationBars();
    }

    BackboneStackChart.prototype.addModificationBars = function() {
      var i, mod, modificationSites, _i, _len, _results;
      modificationSites = GlycopeptideLib.parseModificationSites(this.glycopeptide);
      _results = [];
      for (_i = 0, _len = modificationSites.length; _i < _len; _i++) {
        mod = modificationSites[_i];
        _results.push(this.config.series.push({
          name: "" + mod.name + "-" + mod.position,
          data: (function() {
            var _j, _ref, _results1;
            _results1 = [];
            for (i = _j = 0, _ref = this.glycopeptide.peptideLens; 0 <= _ref ? _j <= _ref : _j >= _ref; i = 0 <= _ref ? ++_j : --_j) {
              _results1.push([i, mod.position]);
            }
            return _results1;
          }).call(this),
          type: "scatter",
          color: addAlphaToRGB(new RGBColor(ColorSource.getColor(mod.name)), 0.65),
          marker: {
            radius: 4,
            symbol: "circle"
          }
        }));
      }
      return _results;
    };

    BackboneStackChart.prototype.render = function() {
      this.chart = $(this.container).highcharts(this.config);
      return this;
    };

    return BackboneStackChart;

  })();
  ns.ModificationDistributionChart = ModificationDistributionChart = (function() {
    function ModificationDistributionChart(predictions, container) {
      this.predictions = predictions;
      this.container = container;
    }

    ModificationDistributionChart.prototype.render = function() {
      this.chart = $(this.container).highcharts(this.config);
      return this;
    };

    return ModificationDistributionChart;

  })();
  return ns;
})();
