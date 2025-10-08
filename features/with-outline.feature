Feature: My Feature with Outline

  Scenario Outline: Some Scenario with Outline and big integers
    When I set counter to big <value>
    Then I should see the counter is a bigint
    And It should match snapshot

    Examples:
      | value |
      | 1     |
      | 2     |

  Scenario Outline: Some Scenario with Outline and integers
    Given The counter is reset
    When I increase the counter by <first>
    And I increase the counter by <second>
    Then I should see the counter is a number
    And It should match snapshot

    Examples:
      | first | second |
      | 1     | 2      |
      | 2     | 3      |
