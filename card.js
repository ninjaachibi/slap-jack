class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
  }

  toString() {
    function jsUcfirst(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    var ret = '';
    var value = this.value;
    var suit = jsUcfirst(this.suit);

    if (value === 1) {
      ret = 'Ace'
    }
    else if (value === 11) {
      ret = 'Jack'
    }
    else if (value === 12) {
      ret = 'Queen'
    }
    else if (value === 13) {
      ret = 'King'
    }
    else {
      ret = value;
    }

    return ret + ' of ' + suit;
  }

  // PERSISTENCE FUNCTIONS
  // =====================
  fromObject(object) {
    this.value = object.value;
    this.suit = object.suit;
  }

  toObject() {
    return {
      value: this.value,
      suit: this.suit
    };
  }
}

module.exports = Card;
