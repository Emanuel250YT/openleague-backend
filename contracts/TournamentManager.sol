// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/**
 * @title TournamentManager
 * @dev Manages tournaments with prize pools and winner payouts
 */
contract TournamentManager is Ownable, ReentrancyGuard {
  struct Tournament {
    string name;
    uint256 prizePool;
    address organizer;
    bool isActive;
    bool isPaidOut;
    mapping(address => bool) participants;
    address[] participantList;
  }

  uint256 public tournamentCounter;
  mapping(uint256 => Tournament) public tournaments;

  event TournamentCreated(uint256 indexed tournamentId, string name, address indexed organizer);
  event ParticipantAdded(uint256 indexed tournamentId, address indexed participant);
  event PrizePoolIncreased(uint256 indexed tournamentId, uint256 amount);
  event WinnersPaidOut(uint256 indexed tournamentId, address[] winners, uint256[] amounts);
  event TournamentClosed(uint256 indexed tournamentId);

  constructor() Ownable(msg.sender) {} /**
   * @dev Creates a new tournament
   * @param _name Tournament name
   */
  function createTournament(string memory _name) external payable returns (uint256) {
    tournamentCounter++;
    uint256 tournamentId = tournamentCounter;

    Tournament storage newTournament = tournaments[tournamentId];
    newTournament.name = _name;
    newTournament.prizePool = msg.value;
    newTournament.organizer = msg.sender;
    newTournament.isActive = true;
    newTournament.isPaidOut = false;

    emit TournamentCreated(tournamentId, _name, msg.sender);

    if (msg.value > 0) {
      emit PrizePoolIncreased(tournamentId, msg.value);
    }

    return tournamentId;
  }

  /**
   * @dev Adds a participant to a tournament
   * @param _tournamentId Tournament ID
   * @param _participant Participant address
   */
  function addParticipant(uint256 _tournamentId, address _participant) external {
    Tournament storage tournament = tournaments[_tournamentId];
    require(tournament.isActive, 'Tournament is not active');
    require(msg.sender == tournament.organizer, 'Only organizer can add participants');
    require(!tournament.participants[_participant], 'Participant already added');

    tournament.participants[_participant] = true;
    tournament.participantList.push(_participant);

    emit ParticipantAdded(_tournamentId, _participant);
  }

  /**
   * @dev Increases the prize pool of a tournament
   * @param _tournamentId Tournament ID
   */
  function increasePrizePool(uint256 _tournamentId) external payable {
    Tournament storage tournament = tournaments[_tournamentId];
    require(tournament.isActive, 'Tournament is not active');
    require(msg.value > 0, 'Must send ETH');

    tournament.prizePool += msg.value;

    emit PrizePoolIncreased(_tournamentId, msg.value);
  }

  /**
   * @dev Distributes prizes to winners
   * @param _tournamentId Tournament ID
   * @param _winners Array of winner addresses
   * @param _amounts Array of prize amounts
   */
  function payoutWinners(
    uint256 _tournamentId,
    address[] calldata _winners,
    uint256[] calldata _amounts
  ) external nonReentrant {
    Tournament storage tournament = tournaments[_tournamentId];
    require(tournament.isActive, 'Tournament is not active');
    require(msg.sender == tournament.organizer, 'Only organizer can payout');
    require(!tournament.isPaidOut, 'Already paid out');
    require(_winners.length == _amounts.length, 'Array length mismatch');

    uint256 totalPayout = 0;
    for (uint256 i = 0; i < _amounts.length; i++) {
      totalPayout += _amounts[i];
    }
    require(totalPayout <= tournament.prizePool, 'Insufficient prize pool');

    for (uint256 i = 0; i < _winners.length; i++) {
      require(tournament.participants[_winners[i]], 'Winner not a participant');
      (bool success, ) = _winners[i].call{value: _amounts[i]}('');
      require(success, 'Transfer failed');
    }

    tournament.isPaidOut = true;
    tournament.isActive = false;

    emit WinnersPaidOut(_tournamentId, _winners, _amounts);
    emit TournamentClosed(_tournamentId);
  }

  /**
   * @dev Gets tournament details
   * @param _tournamentId Tournament ID
   */
  function getTournament(
    uint256 _tournamentId
  )
    external
    view
    returns (
      string memory name,
      uint256 prizePool,
      address organizer,
      bool isActive,
      bool isPaidOut,
      uint256 participantCount
    )
  {
    Tournament storage tournament = tournaments[_tournamentId];
    return (
      tournament.name,
      tournament.prizePool,
      tournament.organizer,
      tournament.isActive,
      tournament.isPaidOut,
      tournament.participantList.length
    );
  }

  /**
   * @dev Gets all participants of a tournament
   * @param _tournamentId Tournament ID
   */
  function getParticipants(uint256 _tournamentId) external view returns (address[] memory) {
    return tournaments[_tournamentId].participantList;
  }

  /**
   * @dev Checks if an address is a participant
   * @param _tournamentId Tournament ID
   * @param _participant Address to check
   */
  function isParticipant(uint256 _tournamentId, address _participant) external view returns (bool) {
    return tournaments[_tournamentId].participants[_participant];
  }
}
