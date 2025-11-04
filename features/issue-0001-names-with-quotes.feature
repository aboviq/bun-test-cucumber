Feature: Issue #1 - Names with 'Quotes', "Double Quotes" and `Backticks`

  Scenario: Name with 'quotes'
    When I push '"value"'
    And I push '"another value"'
    Then I have data

  Scenario: Name with "double quotes"
    When I push "'value'"
    And I push "'another value'"
    Then I have data

  Scenario: Name with `backticks`
    When I push "`value`"
    And I push "`another value`"
    Then I have data
