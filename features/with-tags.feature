@array
Feature: My Feature with Tags
  This feature is tagged with @array

  @before
  Scenario: Some Scenario with array data
    When I push "first"
    And I push "second"
    Then I have data

  Scenario: Some Scenario with another array of data
    When I push "when"
    Then I have data
