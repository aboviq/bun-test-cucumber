Feature: My First Feature

  Scenario: Handle integers
    When I set counter to 10
    Then I should see the counter is a number
    Then I should see the counter as a number

  Scenario: Handle big integers
    When I set counter to big 20
    Then I should see the counter is a bigint
    Then I should see the counter as a bigint
