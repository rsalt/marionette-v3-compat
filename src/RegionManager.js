import _ from 'underscore';
import Marionette from 'backbone.marionette';

export default function() {

   // Manage one or more related `Marionette.Region` objects.
  Marionette.RegionManager = Marionette.Object.extend({
    constructor: function(options) {
      this._regions = {};
      this.length = 0;

      Marionette.Object.call(this, options);

      this.addRegions(this.getOption('regions'));
    },

    // Add multiple regions using an object literal or a
    // function that returns an object literal, where
    // each key becomes the region name, and each value is
    // the region definition.
    addRegions: function(regionDefinitions, defaults) {
      regionDefinitions = Marionette._getValue(regionDefinitions, this, arguments);

      if (!_.isEmpty(regionDefinitions)) {
        Marionette.deprecate('RegionManager is deprecated and removed in v3.');
      }

      return _.reduce(regionDefinitions, function(regions, definition, name) {
        if (_.isString(definition)) {
          definition = {selector: definition};
        }
        if (definition.selector) {
          definition = _.defaults({}, definition, defaults);
        }

        regions[name] = this.addRegion(name, definition);
        return regions;
      }, {}, this);
    },

    // Add an individual region to the region manager,
    // and return the region instance
    addRegion: function(name, definition) {
      var region;

      if (definition instanceof Marionette.Region) {
        region = definition;
      } else {
        region = Marionette.Region.buildRegion(definition, Marionette.Region);
      }

      this.triggerMethod('before:add:region', name, region);

      region._parent = this;
      this._store(name, region);

      this.triggerMethod('add:region', name, region);
      return region;
    },

    // Get a region by name
    get: function(name) {
      return this._regions[name];
    },

    // Gets all the regions contained within
    // the `regionManager` instance.
    getRegions: function() {
      return _.clone(this._regions);
    },

    // Remove a region by name
    removeRegion: function(name) {
      var region = this._regions[name];
      this._remove(name, region);

      return region;
    },

    // Empty all regions in the region manager, and
    // remove them
    removeRegions: function() {
      var regions = this.getRegions();
      _.each(this._regions, function(region, name) {
        this._remove(name, region);
      }, this);

      return regions;
    },

    // Empty all regions in the region manager, but
    // leave them attached
    emptyRegions: function() {
      var regions = this.getRegions();
      _.invoke(regions, 'empty');
      return regions;
    },

    // Destroy all regions and shut down the region
    // manager entirely
    destroy: function() {
      this.removeRegions();
      return Marionette.Object.prototype.destroy.apply(this, arguments);
    },

    // internal method to store regions
    _store: function(name, region) {
      if (!this._regions[name]) {
        this.length++;
      }

      this._regions[name] = region;
    },

    // internal method to remove a region
    _remove: function(name, region) {
      this.triggerMethod('before:remove:region', name, region);
      region.empty();
      region.stopListening();

      delete region._parent;
      delete this._regions[name];
      this.length--;
      this.triggerMethod('remove:region', name, region);
    }
  });

  // Mix in methods from Underscore, for iteration, and other
  // collection related features.
  // Borrowing this code from Backbone.Collection:
  // http://backbonejs.org/docs/backbone.html#section-121
  var _actAsCollection = function(object, listProperty) {
    var methods = ['forEach', 'each', 'map', 'find', 'detect', 'filter',
      'select', 'reject', 'every', 'all', 'some', 'any', 'include',
      'contains', 'invoke', 'toArray', 'first', 'initial', 'rest',
      'last', 'without', 'isEmpty', 'pluck'];

    _.each(methods, function(method) {
      object[method] = function() {
        var list = _.values(_.result(this, listProperty));
        var args = [list].concat(_.toArray(arguments));
        return _[method].apply(_, args);
      };
    });
  };

  Marionette.actAsCollection = function(object, listProperty) {
    Marionette.deprecate('actAsCollection is deprecated and removed in v3.');

    return _actAsCollection.apply(this, arguments);
  }

  _actAsCollection(Marionette.RegionManager.prototype, '_regions');

}
