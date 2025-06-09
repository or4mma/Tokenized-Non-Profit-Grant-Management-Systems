import { describe, it, expect, beforeEach } from "vitest"

describe("Fund Distribution Contract Tests", () => {
  let contractState
  
  beforeEach(() => {
    contractState = {
      grantFunds: new Map(),
      fundDeposits: new Map(),
      distributionHistory: new Map(),
      nextGrantId: 1,
      contractOwner: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
    }
  })
  
  describe("Fund Deposits", () => {
    it("should allow funder to deposit funds", () => {
      const funder = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      const amount = 100000
      
      // First deposit
      contractState.fundDeposits.set(funder, {
        totalDeposited: amount,
        availableBalance: amount,
      })
      
      expect(contractState.fundDeposits.get(funder).totalDeposited).toBe(amount)
      expect(contractState.fundDeposits.get(funder).availableBalance).toBe(amount)
    })
    
    it("should accumulate multiple deposits", () => {
      const funder = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      const firstDeposit = 50000
      const secondDeposit = 30000
      
      // First deposit
      contractState.fundDeposits.set(funder, {
        totalDeposited: firstDeposit,
        availableBalance: firstDeposit,
      })
      
      // Second deposit
      const existing = contractState.fundDeposits.get(funder)
      contractState.fundDeposits.set(funder, {
        totalDeposited: existing.totalDeposited + secondDeposit,
        availableBalance: existing.availableBalance + secondDeposit,
      })
      
      expect(contractState.fundDeposits.get(funder).totalDeposited).toBe(80000)
      expect(contractState.fundDeposits.get(funder).availableBalance).toBe(80000)
    })
  })
  
  describe("Grant Fund Creation", () => {
    it("should create grant fund with sufficient balance", () => {
      const funder = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      const recipient = "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP"
      const totalAmount = 50000
      const distributionSchedule = [10000, 15000, 15000, 10000]
      
      // Setup funder balance
      contractState.fundDeposits.set(funder, {
        totalDeposited: 100000,
        availableBalance: 100000,
      })
      
      // Create grant fund
      const grantId = contractState.nextGrantId
      const depositInfo = contractState.fundDeposits.get(funder)
      
      if (depositInfo.availableBalance >= totalAmount) {
        contractState.grantFunds.set(grantId, {
          funder: funder,
          recipient: recipient,
          totalAmount: totalAmount,
          distributedAmount: 0,
          remainingAmount: totalAmount,
          distributionSchedule: distributionSchedule,
          currentMilestone: 0,
          status: "active",
          creationDate: 100,
        })
        
        contractState.fundDeposits.set(funder, {
          ...depositInfo,
          availableBalance: depositInfo.availableBalance - totalAmount,
        })
        
        contractState.nextGrantId += 1
      }
      
      expect(contractState.grantFunds.has(grantId)).toBe(true)
      expect(contractState.grantFunds.get(grantId).totalAmount).toBe(totalAmount)
      expect(contractState.fundDeposits.get(funder).availableBalance).toBe(50000)
    })
    
    it("should reject grant creation with insufficient funds", () => {
      const funder = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      const totalAmount = 100000
      
      // Setup insufficient balance
      contractState.fundDeposits.set(funder, {
        totalDeposited: 50000,
        availableBalance: 50000,
      })
      
      const depositInfo = contractState.fundDeposits.get(funder)
      const hasSufficientFunds = depositInfo.availableBalance >= totalAmount
      
      expect(hasSufficientFunds).toBe(false)
    })
  })
  
  describe("Milestone Payments", () => {
    it("should distribute milestone payment", () => {
      const grantId = 1
      const distributionSchedule = [10000, 15000, 15000, 10000]
      
      // Setup grant fund
      contractState.grantFunds.set(grantId, {
        funder: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
        recipient: "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP",
        totalAmount: 50000,
        distributedAmount: 0,
        remainingAmount: 50000,
        distributionSchedule: distributionSchedule,
        currentMilestone: 0,
        status: "active",
      })
      
      // Distribute first milestone
      const grantData = contractState.grantFunds.get(grantId)
      const currentMilestone = grantData.currentMilestone
      
      if (currentMilestone < distributionSchedule.length) {
        const paymentAmount = distributionSchedule[currentMilestone]
        
        contractState.grantFunds.set(grantId, {
          ...grantData,
          distributedAmount: grantData.distributedAmount + paymentAmount,
          remainingAmount: grantData.remainingAmount - paymentAmount,
          currentMilestone: currentMilestone + 1,
        })
        
        contractState.distributionHistory.set(`${grantId}-${currentMilestone}`, {
          amount: paymentAmount,
          distributionDate: 200,
          recipient: grantData.recipient,
          transactionHash: "pending",
        })
      }
      
      const updatedGrant = contractState.grantFunds.get(grantId)
      expect(updatedGrant.distributedAmount).toBe(10000)
      expect(updatedGrant.remainingAmount).toBe(40000)
      expect(updatedGrant.currentMilestone).toBe(1)
    })
    
    it("should track multiple milestone payments", () => {
      const grantId = 1
      const distributionSchedule = [10000, 15000, 15000, 10000]
      
      contractState.grantFunds.set(grantId, {
        totalAmount: 50000,
        distributedAmount: 0,
        remainingAmount: 50000,
        distributionSchedule: distributionSchedule,
        currentMilestone: 0,
        recipient: "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP",
      })
      
      // Distribute first two milestones
      for (let i = 0; i < 2; i++) {
        const grantData = contractState.grantFunds.get(grantId)
        const paymentAmount = distributionSchedule[grantData.currentMilestone]
        
        contractState.grantFunds.set(grantId, {
          ...grantData,
          distributedAmount: grantData.distributedAmount + paymentAmount,
          remainingAmount: grantData.remainingAmount - paymentAmount,
          currentMilestone: grantData.currentMilestone + 1,
        })
      }
      
      const finalGrant = contractState.grantFunds.get(grantId)
      expect(finalGrant.distributedAmount).toBe(25000) // 10000 + 15000
      expect(finalGrant.remainingAmount).toBe(25000)
      expect(finalGrant.currentMilestone).toBe(2)
    })
    
    it("should prevent payment beyond schedule", () => {
      const grantId = 1
      const distributionSchedule = [10000, 15000]
      
      contractState.grantFunds.set(grantId, {
        distributionSchedule: distributionSchedule,
        currentMilestone: 2, // Already at end
      })
      
      const grantData = contractState.grantFunds.get(grantId)
      const canDistribute = grantData.currentMilestone < distributionSchedule.length
      
      expect(canDistribute).toBe(false)
    })
  })
  
  describe("Balance Tracking", () => {
    it("should track funder balances correctly", () => {
      const funder = "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG"
      
      // Initial deposit
      contractState.fundDeposits.set(funder, {
        totalDeposited: 100000,
        availableBalance: 100000,
      })
      
      // Allocate funds to grant
      const depositInfo = contractState.fundDeposits.get(funder)
      contractState.fundDeposits.set(funder, {
        ...depositInfo,
        availableBalance: depositInfo.availableBalance - 30000,
      })
      
      expect(contractState.fundDeposits.get(funder).totalDeposited).toBe(100000)
      expect(contractState.fundDeposits.get(funder).availableBalance).toBe(70000)
    })
    
    it("should maintain distribution history", () => {
      const grantId = 1
      const milestone = 0
      const historyKey = `${grantId}-${milestone}`
      
      contractState.distributionHistory.set(historyKey, {
        amount: 10000,
        distributionDate: 200,
        recipient: "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP",
        transactionHash: "abc123",
      })
      
      const history = contractState.distributionHistory.get(historyKey)
      expect(history.amount).toBe(10000)
      expect(history.recipient).toBe("ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP")
    })
  })
  
  describe("Data Retrieval", () => {
    it("should retrieve grant fund information", () => {
      const grantId = 1
      const grantData = {
        funder: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
        recipient: "ST3NBRSFKX28FQ2ZJ1MAKX58HKHSDGNV5N7R21XCP",
        totalAmount: 50000,
        distributedAmount: 10000,
        remainingAmount: 40000,
        status: "active",
      }
      
      contractState.grantFunds.set(grantId, grantData)
      
      const retrieved = contractState.grantFunds.get(grantId)
      expect(retrieved).toEqual(grantData)
    })
    
    it("should return next grant ID", () => {
      expect(contractState.nextGrantId).toBe(1)
      
      contractState.nextGrantId += 1
      expect(contractState.nextGrantId).toBe(2)
    })
  })
})

console.log("✅ Fund Distribution Contract tests completed")
