Feature: The library allows RegExp in Steps

  Scenario: Process raw regexp
    Given the step is defined with a regexp
    Then the step extracts groups as arguments
      | the step is defined with a |
      | regexp |


  Scenario Outline: Process typed regexp
    Given the step is defined with a string
    When the string is clamped with <start> and <end>
      | <start> |
      | <end>   |
    Then the step extracts groups as arguments
      | the step is defined with a |
      | string |
    And the arguments have types from capture groups
    And the types notify about optional groups

    Examples:
      | start | end |
      | ^     | $   |
      | /     | /   |
